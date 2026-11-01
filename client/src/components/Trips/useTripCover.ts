import type { Trip } from '@trek/shared';
import { type RefObject, useState } from 'react';

import { useFoundPlacePhotoDetails } from '../Assistant/useFoundPlacePhoto';

/** A chosen cover wins; otherwise use the current trip's verified places. */
export function useTripCover(trip: Trip, ref: RefObject<Element | null>) {
  const [failed, setFailed] = useState<string[]>([]);
  const manual = trip.cover_image && !failed.includes(trip.cover_image) ? trip.cover_image : null;
  const places = manual ? [] : (trip.auto_cover_places ?? []);
  const first = useFoundPlacePhotoDetails(places[0] ?? { name: '' }, ref);
  const second = useFoundPlacePhotoDetails(places[1] ?? { name: '' }, ref);
  const third = useFoundPlacePhotoDetails(places[2] ?? { name: '' }, ref);
  const photo = manual
    ? { src: manual, attribution: null }
    : ([first, second, third].find((entry) => entry.src && !failed.includes(entry.src)) ?? {
        src: null,
        attribution: null,
      });
  return {
    ...photo,
    onError: () => {
      if (photo.src) setFailed((previous) => [...previous, photo.src]);
    },
  };
}
