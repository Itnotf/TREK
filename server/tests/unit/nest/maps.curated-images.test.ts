/**
 * MAPS-147..156 — the curated picture sources behind the place detail column.
 *
 * These are the rungs above "photographed within 300m": the Wikidata item, the
 * article's lead image, and the Commons batch that turns a file name into
 * something creditable. Payload shapes are taken from live responses for Q1097
 * (Berlin Hauptbahnhof), Q27706 (Hamburg Airport) and Q82425 (Brandenburg
 * Gate) — the three places whose pictures were wrong.
 *
 * fetch is stubbed; the DB is mocked the same way maps.service.test.ts does it.
 */
import { WikimediaClient } from '../../../src/nest/maps/providers/wikimedia.client';
import { safeFetchFollow } from '../../../src/utils/ssrfGuard';

import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../../src/db/database', () => ({
  db: { prepare: () => ({ get: () => undefined, run: () => undefined, all: () => [] }) },
}));

vi.mock('../../../src/utils/ssrfGuard', () => ({
  safeFetchFollow: vi.fn(),
  checkSsrf: vi.fn(async () => ({ allowed: true })),
  SsrfBlockedError: class extends Error {},
}));

const svcOf = () => new WikimediaClient();

describe('verified OSM marker photos', () => {
  const candidate = (title: string, descriptors = '') => ({
    photoUrl: `https://upload.wikimedia.org/${encodeURIComponent(title)}.jpg`,
    attribution: 'Photographer',
    license: 'CC BY 3.0',
    licenseUrl: null,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Photo.jpg',
    pageId: null,
    title,
    width: 1200,
    height: 800,
    descriptors,
  });
  const imageResponse = () => new Response(new Uint8Array([1, 2, 3]), { status: 200 });

  it('uses a verified locality photo, rejects a closer dog, and preserves credits/context', async () => {
    const wiki = svcOf();
    vi.spyOn(wiki, 'fetchCommonsCandidates').mockResolvedValue([
      candidate('File:街子古镇-流浪的狗狗.jpg'),
      candidate('File:街子古镇塔.jpg'),
    ]);
    vi.mocked(safeFetchFollow).mockResolvedValueOnce(imageResponse());
    const result = await wiki.downloadOsmPhoto(30.814, 103.556, {
      name: '字库塔',
      address: '字库塔, 瑞龙廊桥, 街子古镇, Chengdu',
      photo_localities: ['Jiezi', '街子镇'],
    });
    expect(result).toMatchObject({ kind: 'photo', attribution: expect.stringContaining('街子区域参考图') });
    expect(result).toMatchObject({ attribution: expect.stringContaining('CC BY 3.0') });
    expect(vi.mocked(safeFetchFollow).mock.calls.at(-1)?.[0]).toContain(encodeURIComponent('街子古镇塔'));
  });

  it('matches a trusted English locality for a Chinese named large attraction', async () => {
    const wiki = svcOf();
    vi.spyOn(wiki, 'fetchCommonsCandidates').mockResolvedValue([
      candidate('File:Yuantong Catholic Church.jpg'),
      candidate('File:Unrelated street.jpg'),
    ]);
    vi.mocked(safeFetchFollow).mockResolvedValueOnce(imageResponse());
    expect(
      await wiki.downloadOsmPhoto(30.733, 103.62, {
        name: '元通古镇',
        address: '元通古镇, 锦江路, Yuantong, Chengdu, Sichuan',
        photo_localities: ['Yuantong'],
      }),
    ).toMatchObject({ kind: 'photo', attribution: expect.stringContaining('Yuantong区域参考图') });
    expect(wiki.fetchCommonsCandidates).toHaveBeenCalledWith(30.733, 103.62, 5, 1000, true);
  });

  it('does not use an unrelated nearby picture or a city match', async () => {
    const wiki = svcOf();
    vi.spyOn(wiki, 'fetchCommonsCandidates').mockResolvedValue([candidate('File:Chengdu restaurant.jpg')]);
    expect(
      await wiki.downloadOsmPhoto(30.733, 103.62, {
        name: '元通古镇',
        address: '元通古镇, 锦江路, 元通镇, Chengdu, Sichuan',
        photo_localities: ['元通镇'],
      }),
    ).toEqual({ kind: 'none' });
  });

  it('prefers the exact Wikidata image to a locality search', async () => {
    const wiki = svcOf();
    vi.spyOn(wiki, 'fetchWikidataCandidates').mockResolvedValue({
      candidates: [candidate('File:Exact attraction.jpg')],
      commonsCategory: null,
    });
    const nearby = vi.spyOn(wiki, 'fetchCommonsCandidates');
    vi.mocked(safeFetchFollow).mockResolvedValueOnce(imageResponse());
    expect(await wiki.downloadOsmPhoto(30.733, 103.62, { name: 'Place', wikidata: 'Q1' })).toMatchObject({
      kind: 'photo',
      attribution: expect.not.stringContaining('区域参考图'),
    });
    expect(nearby).not.toHaveBeenCalled();
  });

  it('treats an HTTP 200 Commons operational error as a short-lived provider failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          error: { code: 'cirrussearch-too-busy-error' },
        }),
      })),
    );
    expect(await svcOf().downloadOsmPhoto(30.73, 103.62, { name: '元通古镇' })).toEqual({ kind: 'failed' });
  });
});

const filePage = (over: Record<string, unknown> = {}) => ({
  pageid: 4711,
  title: 'File:Outside.jpg',
  imageinfo: [
    {
      url: 'https://commons.org/full.jpg',
      thumburl: 'https://commons.org/thumb.jpg',
      mime: 'image/jpeg',
      width: 1600,
      height: 1200,
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:X.jpg',
      extmetadata: { Artist: { value: 'Alice' }, LicenseShortName: { value: 'CC BY-SA 4.0' } },
    },
  ],
  ...over,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchWikidataCandidates', () => {
  it('MAPS-147: refuses anything that is not a Q-id without calling out', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await svcOf().fetchWikidataCandidates('not-a-qid')).toEqual({ candidates: [], commonsCategory: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('MAPS-148: puts the preferred P18 statement ahead of a normal one', async () => {
    // The API returns statements in edit order, not rank order, so reading the
    // first one is a coin toss between the picture an editor chose to represent
    // the place and whatever happened to be added first.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entities: {
            Q82425: {
              claims: {
                P18: [
                  { mainsnak: { datavalue: { value: 'Berlin-Brandenburg Gate overview.jpg' } }, rank: 'normal' },
                  { mainsnak: { datavalue: { value: 'Brandenburger Tor morgens.jpg' } }, rank: 'preferred' },
                ],
                P373: [{ mainsnak: { datavalue: { value: 'Brandenburg Gate' } } }],
              },
            },
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ query: { pages: {} } }) });
    vi.stubGlobal('fetch', fetchMock);

    const out = await svcOf().fetchWikidataCandidates('Q82425');

    const batchUrl = decodeURIComponent(String(fetchMock.mock.calls[1][0]));
    expect(batchUrl.indexOf('Brandenburger Tor morgens')).toBeLessThan(batchUrl.indexOf('overview'));
    // P373 comes back too, so a place with no wikimedia_commons tag still finds
    // its category — Berlin Hauptbahnhof is exactly that case.
    expect(out.commonsCategory).toBe('Brandenburg Gate');
  });

  it('MAPS-149: ignores a deprecated statement', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entities: {
          Q1: { claims: { P18: [{ mainsnak: { datavalue: { value: 'Wrong.jpg' } }, rank: 'deprecated' }] } },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    expect((await svcOf().fetchWikidataCandidates('Q1')).candidates).toEqual([]);
    // Nothing worth asking Commons about, so Commons is not asked.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('MAPS-150: gathers the other view properties, not just P18', async () => {
    // A station is not one view. P5775 (interior), P3451 (night) and P8592
    // (aerial) are what make the strip genuinely different pictures rather than
    // four takes on the same facade.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entities: {
            Q1097: {
              claims: {
                P18: [{ mainsnak: { datavalue: { value: 'Outside.jpg' } } }],
                P5775: [{ mainsnak: { datavalue: { value: 'Inside.jpg' } } }],
                P3451: [{ mainsnak: { datavalue: { value: 'AtNight.jpg' } } }],
              },
            },
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ query: { pages: {} } }) });
    vi.stubGlobal('fetch', fetchMock);

    await svcOf().fetchWikidataCandidates('Q1097');

    const batchUrl = decodeURIComponent(String(fetchMock.mock.calls[1][0]));
    expect(batchUrl).toContain('File:Outside.jpg|File:Inside.jpg|File:AtNight.jpg');
  });

  it('MAPS-151: hands the files back in the order the claims implied', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entities: {
            Q1: {
              claims: {
                P18: [{ mainsnak: { datavalue: { value: 'First.jpg' } } }],
                P5775: [{ mainsnak: { datavalue: { value: 'Second.jpg' } } }],
              },
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        // Deliberately the other way round: a batch response does not preserve
        // the order the titles went in.
        json: async () => ({
          query: {
            pages: {
              '2': filePage({ pageid: 2, title: 'File:Second.jpg' }),
              '1': filePage({ pageid: 1, title: 'File:First.jpg' }),
            },
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const out = await svcOf().fetchWikidataCandidates('Q1');
    expect(out.candidates.map((c) => c.title)).toEqual(['File:First.jpg', 'File:Second.jpg']);
  });

  it('MAPS-152: survives a bad response and a throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect(await svcOf().fetchWikidataCandidates('Q1')).toEqual({ candidates: [], commonsCategory: null });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect(await svcOf().fetchWikidataCandidates('Q1')).toEqual({ candidates: [], commonsCategory: null });
  });
});

describe('fetchCommonsFilesByName', () => {
  it('MAPS-153: follows a rename back to the name the caller asked for', async () => {
    // Wikidata claims and article lead images routinely name files that have
    // since been renamed. Without redirects the API answers with a `missing`
    // page and the picture disappears without a word.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          normalized: [{ from: 'File:old_name.jpg', to: 'File:Old name.jpg' }],
          redirects: [{ from: 'File:Old name.jpg', to: 'File:New name.jpg' }],
          pages: { '9': filePage({ pageid: 9, title: 'File:New name.jpg' }) },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const out = await svcOf().fetchCommonsFilesByName(['old_name.jpg']);

    expect(String(fetchMock.mock.calls[0][0])).toContain('redirects=1');
    expect(out.get('old name.jpg')?.pageId).toBe(9);
    // And under its current name, for callers that already resolved it.
    expect(out.get('new name.jpg')?.pageId).toBe(9);
  });

  it('MAPS-154: asks nothing for an empty list', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect((await svcOf().fetchCommonsFilesByName([])).size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('MAPS-154b: returns an empty map on a bad response or a throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect((await svcOf().fetchCommonsFilesByName(['X.jpg'])).size).toBe(0);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect((await svcOf().fetchCommonsFilesByName(['X.jpg'])).size).toBe(0);
  });
});

describe('fetchWikiLeadImageName', () => {
  it('MAPS-155: asks Wikivoyage before Wikipedia and returns only the file name', async () => {
    // Only the name. The thumbnail URL the API offers alongside carries no
    // author, and a picture that cannot be credited cannot be shown.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ query: { pages: { '1': {} } } }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: { pages: { '2': { pageimage: 'Hamburg airport terminals.jpg' } } } }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const name = await svcOf().fetchWikiLeadImageName('de:Flughafen Hamburg');

    expect(name).toBe('Hamburg airport terminals.jpg');
    expect(String(fetchMock.mock.calls[0][0])).toContain('de.wikivoyage.org');
    expect(String(fetchMock.mock.calls[1][0])).toContain('de.wikipedia.org');
  });

  it('MAPS-156: yields null without a tag and survives a throw', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await svcOf().fetchWikiLeadImageName(null)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect(await svcOf().fetchWikiLeadImageName('de:X')).toBeNull();
  });
});
