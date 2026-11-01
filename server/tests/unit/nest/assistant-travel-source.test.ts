import { readTravelSource } from '../../../src/nest/assistant/assistant-travel-source';

import dns from 'node:dns/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:dns/promises', () => ({ default: { lookup: vi.fn() } }));
vi.mock('undici', () => ({ Agent: class {}, ProxyAgent: class {} }));

const lookup = vi.mocked(dns.lookup);
const fetchMock = vi.fn<typeof fetch>();
const CAPTION = '云南七日自驾攻略：昆明出发，经大理古城、洱海和丽江，最后返回昆明。每天留出休息时间。';

function upstream(
  body: string | ReadableStream<Uint8Array>,
  type = 'text/html',
  url = 'https://travel.example/guide',
  status = 200,
) {
  const response = new Response(body, { status, headers: { 'content-type': type } });
  Object.defineProperty(response, 'url', { value: url });
  return response;
}

beforeEach(() => {
  lookup.mockResolvedValue({ address: '93.184.216.34', family: 4 });
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('travel source reading', () => {
  it('reads article text, titles and entities while excluding executable and navigation content', async () => {
    fetchMock.mockResolvedValue(
      upstream(`<!doctype html><html><head>
      <title>云南 &amp; 自驾</title><meta name="description" content="七天环线 &#x653b;&#x7565;">
      <script>throw new Error('execute me'); var fake = '<meta property="og:title" content="fake title">';</script>
      <style>.secret{display:none}</style></head><body>
      <nav>Navigation that must not become itinerary text</nav>
      <article><h1>昆明出发</h1><p>${CAPTION}</p><p>第二天：大理 &lt;休息&gt;，第三天游览洱海。</p></article>
      <footer>Contact us and sign in for promotional offers.</footer></body></html>`),
    );

    const result = await readTravelSource('https://travel.example/guide#comments');

    expect(result).toMatchObject({
      status: 'read',
      extraction: 'article',
      title: '云南 & 自驾',
      url: 'https://travel.example/guide',
    });
    expect(result.text).toContain('七天环线 攻略');
    expect(result.text).toContain(CAPTION);
    expect(result.text).toContain('大理 <休息>');
    expect(result.text).not.toMatch(/execute me|fake title|Navigation|Contact us|secret/);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://travel.example/guide',
      expect.objectContaining({
        credentials: 'omit',
        redirect: 'manual',
        signal: expect.any(AbortSignal),
        headers: { Accept: 'text/html, application/xhtml+xml, text/plain', 'User-Agent': 'TREK travel-source reader' },
      }),
    );
  });

  it.each(['https://www.xiaohongshu.com/explore/example', 'https://www.douyin.com/video/example'])(
    'labels a public share caption as metadata, never as a full video transcript: %s',
    async (url) => {
      fetchMock.mockResolvedValue(
        upstream(
          `<head><meta content='云南七日自驾' property='og:title'>
        <meta content='${CAPTION}' property='og:description'></head><body><div id="app"></div></body>`,
          'text/html',
          url,
        ),
      );

      expect(await readTravelSource(url)).toEqual({
        url,
        title: '云南七日自驾',
        text: CAPTION,
        status: 'read',
        extraction: 'metadata',
      });
    },
  );

  it('follows a public short link and retains the final source URL', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://travel.example/guide' } }))
      .mockResolvedValueOnce(upstream(`<main><p>${CAPTION}</p></main>`));

    const result = await readTravelSource('https://xhslink.com/example');
    expect(result).toMatchObject({ status: 'read', extraction: 'article', url: 'https://travel.example/guide' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]?.headers).not.toHaveProperty('Cookie');
    expect(fetchMock.mock.calls[1][1]?.headers).not.toHaveProperty('Authorization');
  });

  it.each([
    'file:///etc/passwd',
    'ftp://travel.example/guide',
    'https://user:password@travel.example/guide',
    'not a link',
  ])('refuses unsupported or credential-bearing input before making a request: %s', async (url) => {
    expect(await readTravelSource(url)).toMatchObject({
      status: 'unreadable',
      reason: 'invalid_url',
      text: '',
      url: '',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['127.0.0.1', '192.168.1.10', '169.254.169.254'])(
    'uses the real SSRF guard to block a private destination: %s',
    async (address) => {
      lookup.mockResolvedValue({ address, family: 4 });
      expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
        status: 'unreadable',
        reason: 'blocked',
        text: '',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('checks a redirect destination before fetching its private address', async () => {
    lookup
      .mockResolvedValueOnce({ address: '93.184.216.34', family: 4 })
      .mockResolvedValue({ address: '10.0.0.1', family: 4 });
    fetchMock.mockResolvedValue(
      new Response(null, { status: 302, headers: { location: 'http://internal.example/secret' } }),
    );

    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'blocked',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    '<title>安全验证</title><p>请完成验证后继续浏览。</p>',
    '<title>Just a moment...</title><p>Enable JavaScript and cookies to continue.</p>',
    '<body><p>登录后查看全部内容</p></body>',
  ])('returns an explicit access failure instead of reading a login or challenge page', async (html) => {
    fetchMock.mockResolvedValue(upstream(html));
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'access_required',
      text: '',
      extraction: null,
    });
  });

  it('does not read content from a script-only app shell or from commented metadata', async () => {
    fetchMock.mockResolvedValue(
      upstream(`<head><!-- <meta property="og:description" content="${CAPTION}"> -->
      <script>window.__DATA__ = {text: '${CAPTION}'};</script></head><body><div id="app"></div></body>`),
    );
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'no_content',
      text: '',
    });
  });

  it('rejects video responses and unsuccessful status codes', async () => {
    fetchMock
      .mockResolvedValueOnce(upstream('binary', 'video/mp4'))
      .mockResolvedValueOnce(upstream('access denied', 'text/html', undefined, 403));
    expect(await readTravelSource('https://travel.example/video')).toMatchObject({
      status: 'unreadable',
      reason: 'unsupported_type',
    });
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'http_error',
    });
  });

  it('bounds returned plain text to 12,000 characters', async () => {
    fetchMock.mockResolvedValue(upstream(CAPTION.repeat(400), 'text/plain'));
    const result = await readTravelSource('https://travel.example/guide');
    expect(result).toMatchObject({ status: 'read', extraction: 'text' });
    expect(result.text).toHaveLength(12_000);
  });

  it('rejects declared oversized bodies through the shared response cap', async () => {
    fetchMock.mockResolvedValue(
      new Response('body', { headers: { 'content-type': 'text/html', 'content-length': String(1024 * 1024 + 1) } }),
    );
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'too_large',
      text: '',
    });
  });

  it('rejects oversized streamed bodies even without Content-Length', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(1024 * 1024));
        controller.enqueue(new Uint8Array(1));
        controller.close();
      },
    });
    fetchMock.mockResolvedValue(upstream(stream));
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'too_large',
    });
  });

  it('uses a deadline for the exchange and distinguishes it from other fetch failures', async () => {
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(AbortSignal.abort(new DOMException('Timed out', 'TimeoutError')));
    fetchMock.mockImplementation(async (_url, init) => {
      init?.signal?.throwIfAborted();
      return upstream('unused');
    });
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'timed_out',
    });
    expect(timeout).toHaveBeenCalledWith(12_000);

    timeout.mockRestore();
    fetchMock.mockRejectedValue(new Error('connection failed'));
    expect(await readTravelSource('https://travel.example/guide')).toMatchObject({
      status: 'unreadable',
      reason: 'fetch_failed',
    });
  });
});
