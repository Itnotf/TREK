import type { DB } from '../../kysely/db';

import type { Kysely } from 'kysely';

type CoverDB = Pick<DB, 'places' | 'day_assignments' | 'days'>;

/** One narrow batch read; deleted visits and unrelated catalog places cannot supply a cover. */
export async function listTripCoverPlaces(db: Kysely<CoverDB>, tripIds: number[]) {
  if (!tripIds.length) return [];
  return db
    .selectFrom('places as p')
    .innerJoin('day_assignments as a', 'a.place_id', 'p.id')
    .innerJoin('days as d', 'd.id', 'a.day_id')
    .select(['p.trip_id', 'p.name', 'p.lat', 'p.lng', 'p.google_place_id', 'p.osm_id'])
    .where('p.trip_id', 'in', tripIds)
    .whereRef('d.trip_id', '=', 'p.trip_id')
    .where('a.accommodation_id', 'is', null)
    .where('p.lat', 'is not', null)
    .where('p.lng', 'is not', null)
    .where((eb) => eb.or([eb('p.duration_minutes', 'is', null), eb('p.duration_minutes', '>', 0)]))
    .where((eb) => eb.or([eb('p.stop_type', 'is', null), eb('p.stop_type', '=', 'sights')]))
    .where((eb) => eb.or([eb('p.google_place_id', 'is not', null), eb('p.osm_id', 'is not', null)]))
    .orderBy('p.trip_id')
    .orderBy('d.day_number')
    .orderBy('a.order_index')
    .orderBy('p.id')
    .execute();
}
