import type { PlacesRepository } from '../../db/repositories/Places.repository';
import { tripCoverPlaceSchema, type TripCoverPlace } from '@trek/shared';

/** Reading a cover never persists a selected photo or changes the itinerary. */
export async function withTripCoverPlaces<T extends { id: number; cover_image?: string | null }>(
  trips: T[],
  places: Pick<PlacesRepository, 'listCoverPlacesForTrips'>,
): Promise<Array<T & { auto_cover_places?: TripCoverPlace[] }>> {
  const ids = trips.filter((trip) => !trip.cover_image).map((trip) => trip.id);
  if (!ids.length) return trips;
  const candidates = await places.listCoverPlacesForTrips(ids);
  const covers = new Map<number, TripCoverPlace[]>();
  for (const place of candidates) {
    const selected = covers.get(place.trip_id) ?? [];
    if (selected.length === 3) continue;
    const photoKey = [place.google_place_id, place.osm_id].find(
      (key) => tripCoverPlaceSchema.shape.photoKey.safeParse(key).success,
    );
    const parsed = tripCoverPlaceSchema.safeParse({ name: place.name, photoKey, lat: place.lat, lng: place.lng });
    if (parsed.success && !selected.some((photo) => photo.photoKey === parsed.data.photoKey)) {
      selected.push(parsed.data);
      covers.set(place.trip_id, selected);
    }
  }
  return trips.map((trip) => {
    const photos = covers.get(trip.id);
    return photos?.length ? { ...trip, auto_cover_places: photos } : trip;
  });
}
