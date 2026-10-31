/**
 * PlacePhotoResolver on its own: the outcomes of the two photo sources mapped
 * onto the negative cache. The full getPlacePhoto flow (cache hit, in-flight
 * dedupe, Google then Wikimedia) runs through MapsService in
 * maps.service.test.ts; this pins the cases a source answer alone decides.
 */
import { PlacePhotoResolver } from '../../../src/nest/maps/place-photo.resolver';
import type { PlacesProviderSelector } from '../../../src/nest/maps/places-provider.selector';
import type { GooglePlacesClient } from '../../../src/nest/maps/providers/google-places.provider';
import type { OsmClient } from '../../../src/nest/maps/providers/osm.client';
import type { WikimediaClient } from '../../../src/nest/maps/providers/wikimedia.client';
import type { PlacePhotoCacheService } from '../../../src/nest/place-photos/place-photo-cache.service';

import { describe, expect, it, vi } from 'vitest';

function cache(over: Record<string, unknown> = {}) {
  return {
    get: vi.fn(async () => null),
    getErrored: vi.fn(async () => false),
    getInFlight: vi.fn(() => undefined),
    setInFlight: vi.fn(),
    markError: vi.fn(async () => {}),
    put: vi.fn(async (id: string, _bytes: Buffer, attribution: string | null) => ({
      photoUrl: `/p/${id}`,
      filePath: '/x',
      attribution,
    })),
    ...over,
  };
}

function resolver(
  c: ReturnType<typeof cache>,
  wikiOutcome: unknown,
  key: string | null = null,
  googleOutcome: unknown = { kind: 'none' },
) {
  const google = { firstPhoto: vi.fn(async () => googleOutcome) };
  const wiki = { downloadPhoto: vi.fn(async () => wikiOutcome), downloadOsmPhoto: vi.fn(async () => wikiOutcome) };
  const osm = {
    elementDetails: vi.fn(async () => ({ name: '元通古镇', address: '元通古镇, 锦江路, Yuantong' })),
    lookupNominatim: vi.fn(async () => null),
  };
  const selector = { getMapsKey: vi.fn(async () => key) };
  const r = new PlacePhotoResolver(
    c as unknown as PlacePhotoCacheService,
    google as unknown as GooglePlacesClient,
    wiki as unknown as WikimediaClient,
    selector as unknown as PlacesProviderSelector,
    osm as unknown as OsmClient,
  );
  return { r, google, wiki, osm };
}

describe('PlacePhotoResolver', () => {
  it('retries old OSM misses with verified identity without changing the confirmed itinerary', async () => {
    const c = cache({ getErrored: vi.fn(async (key: string) => key === 'relation:20062385') });
    const { r, wiki, osm } = resolver(c, { kind: 'photo', bytes: Buffer.from([1]), attribution: 'A' });
    expect((await r.resolve(1, 'relation:20062385', 30.73, 103.62, 'AI activity label')).photoUrl).toBe(
      '/api/maps/place-photo/relation%3A20062385/bytes',
    );
    expect(osm.elementDetails).toHaveBeenCalledWith('relation:20062385', 'en');
    expect(wiki.downloadOsmPhoto).toHaveBeenCalledWith(30.73, 103.62, {
      name: '元通古镇',
      address: '元通古镇, 锦江路, Yuantong',
      photo_localities: [],
    });
    expect(wiki.downloadPhoto).not.toHaveBeenCalled();
    expect(c.put).toHaveBeenCalled();
  });

  it('remembers new OSM misses under the versioned negative key', async () => {
    const c = cache();
    const { r } = resolver(c, { kind: 'none' });
    await r.resolve(1, 'node:5815555248', 30.81, 103.55);
    expect(c.markError).toHaveBeenCalledWith('node:5815555248~osm-photo-v2', 'no-photo');
  });

  it('PHOTO-R-001: a Wikimedia picture the disk cache cannot store counts as a provider failure', async () => {
    const c = cache({
      put: vi.fn(async () => {
        throw new Error('disk full');
      }),
    });
    const { r } = resolver(c, { kind: 'photo', bytes: Buffer.from([1]), attribution: 'A' });
    expect(await r.resolve(1, 'coords:1,2', 1, 2, 'X')).toEqual({ photoUrl: null, attribution: null });
    expect(c.markError).toHaveBeenCalledWith('coords:1,2', 'provider-error');
  });

  it('PHOTO-R-002: nothing anywhere is remembered as a plain miss', async () => {
    const c = cache();
    const { r } = resolver(c, { kind: 'none' });
    expect(await r.resolve(1, 'coords:1,2', 1, 2)).toEqual({ photoUrl: null, attribution: null });
    expect(c.markError).toHaveBeenCalledWith('coords:1,2', 'no-photo');
  });

  it('PHOTO-R-003: a Google photo only updates the photo cache, and Wikimedia is never asked', async () => {
    const c = cache();
    const { r, wiki } = resolver(c, { kind: 'none' }, 'key', {
      kind: 'photo',
      bytes: Buffer.from([1]),
      attribution: 'G',
    });
    expect(await r.resolve(1, 'ChIJabc', 1, 2)).toEqual({
      photoUrl: '/api/maps/place-photo/ChIJabc/bytes',
      attribution: 'G',
    });
    expect(c.put).toHaveBeenCalledWith('ChIJabc', Buffer.from([1]), 'G');
    expect(wiki.downloadPhoto).not.toHaveBeenCalled();
  });

  it('PHOTO-R-004: a Google failure falls back to Wikimedia and is remembered briefly when that has nothing', async () => {
    const c = cache();
    const { r, wiki } = resolver(c, { kind: 'none' }, 'key', { kind: 'failed' });
    expect(await r.resolve(1, 'ChIJabc', 1, 2)).toEqual({ photoUrl: null, attribution: null });
    expect(wiki.downloadPhoto).toHaveBeenCalledWith(1, 2, undefined);
    expect(c.markError).toHaveBeenCalledWith('ChIJabc', 'provider-error');
  });
});
