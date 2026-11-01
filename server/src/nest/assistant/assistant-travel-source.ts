import { ResponseTooLargeError, safeFetchFollow, SsrfBlockedError } from '../../utils/ssrfGuard';
import { stripHtmlTags } from '../common/stripHtmlTags';
import { sanitizeRichTextHtml } from '@trek/shared/sanitize';

const MAX_BYTES = 1024 * 1024;
const MAX_TEXT = 12_000;
const ACCESS_GATE =
  /captcha|verify you are human|security verification|just a moment|enable javascript and cookies|安全验证|验证中心|请先登录|登录后.{0,8}(?:查看|访问)|访问受限|内容无法访问/i;

type UnreadableReason =
  | 'invalid_url'
  | 'blocked'
  | 'http_error'
  | 'unsupported_type'
  | 'too_large'
  | 'timed_out'
  | 'fetch_failed'
  | 'no_content'
  | 'access_required';

export interface TravelSourceResult {
  url: string;
  title: string;
  text: string;
  status: 'read' | 'unreadable';
  extraction: 'article' | 'metadata' | 'text' | null;
  reason?: UnreadableReason;
}

function unreadable(url: string, reason: UnreadableReason, title = ''): TravelSourceResult {
  return { url, title, text: '', status: 'unreadable', extraction: null, reason };
}

/** Use the existing inert HTML sanitiser; decoded angle brackets remain text. */
function plainText(html: string): string {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return stripHtmlTags(sanitizeRichTextHtml(`<div>${html}</div>`), ' ')
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name: string) => entities[name])
    .replace(/\s+/g, ' ')
    .trim();
}

/** Skip entire non-content blocks before reading metadata, including fake tags inside scripts. */
function contentMarkup(html: string): string {
  const lower = html.toLowerCase();
  const starts = /<!--|<(script|style|noscript|template|iframe|svg|nav|header|footer|form)\b[^<>]{0,1024}>/gi;
  let out = '';
  let cursor = 0;
  for (let match = starts.exec(html); match; match = starts.exec(html)) {
    out += html.slice(cursor, match.index);
    const endTag = match[0] === '<!--' ? '-->' : `</${match[1].toLowerCase()}>`;
    const end = lower.indexOf(endTag, starts.lastIndex);
    if (end < 0) return out;
    cursor = end + endTag.length;
    starts.lastIndex = cursor;
  }
  return out + html.slice(cursor);
}

function metadata(html: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const tag of html.matchAll(/<meta\b[^<>]{0,16384}>/gi)) {
    const attributes = new Map<string, string>();
    for (const attr of tag[0].matchAll(/\b([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
      attributes.set(attr[1].toLowerCase(), attr[2] ?? attr[3] ?? attr[4]);
    }
    const name = attributes.get('property') ?? attributes.get('name');
    const content = attributes.get('content');
    if (name && content && !values.has(name.toLowerCase())) values.set(name.toLowerCase(), plainText(content));
  }
  return values;
}

function mainContent(html: string): { markup: string; article: boolean } {
  const lower = html.toLowerCase();
  for (const tag of ['article', 'main']) {
    const start = new RegExp(`<${tag}\\b[^<>]{0,1024}>`, 'i').exec(html);
    if (!start) continue;
    const from = start.index + start[0].length;
    const end = lower.indexOf(`</${tag}>`, from);
    return { markup: html.slice(from, end < 0 ? undefined : end), article: true };
  }
  const headEnd = lower.indexOf('</head>');
  return { markup: headEnd < 0 ? html : html.slice(headEnd + 7), article: false };
}

function readMarkup(url: string, html: string): TravelSourceResult {
  const content = contentMarkup(html);
  const meta = metadata(content);
  const title = (
    meta.get('og:title') ?? plainText(content.match(/<title\b[^<>]{0,1024}>([^<]{0,2048})/i)?.[1] ?? '')
  ).slice(0, 200);
  const description = meta.get('og:description') ?? meta.get('description') ?? meta.get('twitter:description') ?? '';
  const main = mainContent(content);
  const body = plainText(main.markup);
  if (ACCESS_GATE.test(title) || (body.length < 400 && ACCESS_GATE.test(body))) {
    return unreadable(url, 'access_required', title);
  }
  const meaningfulBody = body.length >= 40 && body !== title;
  const text = (meaningfulBody ? [description, body].filter(Boolean).join('\n\n') : description).slice(0, MAX_TEXT);
  if (text.length < 20) return unreadable(url, 'no_content', title);
  return {
    url,
    title,
    text,
    status: 'read',
    extraction: meaningfulBody ? (main.article ? 'article' : 'text') : 'metadata',
  };
}

/** Read only public text supplied by the page; video/audio and authenticated pages need user-provided text. */
export async function readTravelSource(rawUrl: string): Promise<TravelSourceResult> {
  let url: string;
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || rawUrl.length > 4096) {
      return unreadable('', 'invalid_url');
    }
    parsed.hash = '';
    url = parsed.href;
  } catch {
    return unreadable('', 'invalid_url');
  }
  try {
    const response = await safeFetchFollow(
      url,
      {
        headers: { Accept: 'text/html, application/xhtml+xml, text/plain', 'User-Agent': 'TREK travel-source reader' },
        credentials: 'omit',
      },
      { timeoutMs: 12_000, maxBytes: MAX_BYTES, bypassInternalIpAllowed: true },
    );
    const finalUrl = response.url || url;
    if (!response.ok) {
      await response.body?.cancel();
      return unreadable(finalUrl, 'http_error');
    }
    const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (type && !['text/html', 'application/xhtml+xml', 'text/plain'].includes(type)) {
      await response.body?.cancel();
      return unreadable(finalUrl, 'unsupported_type');
    }
    const text = await response.text();
    if (type !== 'text/plain') return readMarkup(finalUrl, text);
    const content = text.trim().slice(0, MAX_TEXT);
    if (content.length < 20) return unreadable(finalUrl, 'no_content');
    if (content.length < 400 && ACCESS_GATE.test(content)) return unreadable(finalUrl, 'access_required');
    return { url: finalUrl, title: '', text: content, status: 'read', extraction: 'text' };
  } catch (error: unknown) {
    if (error instanceof SsrfBlockedError) return unreadable(url, 'blocked');
    if (error instanceof ResponseTooLargeError) return unreadable(url, 'too_large');
    if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name))
      return unreadable(url, 'timed_out');
    return unreadable(url, 'fetch_failed');
  }
}
