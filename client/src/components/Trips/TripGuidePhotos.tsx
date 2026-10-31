import { isOutsideChina, type ItineraryPlan } from '@trek/shared';
import { MapPin } from 'lucide-react';
import { useRef, useState } from 'react';

import { useTranslation } from '../../i18n';
import { useFoundPlacePhotoDetails } from '../Assistant/useFoundPlacePhoto';
import { getAmapUrlForPlace } from '../Planner/placeAmap';
import { getOpenStreetMapUrlForPlace } from '../Planner/placeOpenStreetMap';

type Stop = ItineraryPlan['days'][number]['stops'][number];
const photoPlace = (stop?: Stop) => ({ name: stop?.name ?? '', photoKey: stop?.location?.place_id, ...stop?.location });

function PhotoCredit({ text }: { text: string }) {
  const source = text.match(/https:\/\/commons\.wikimedia\.org\/wiki\/\S+$/);
  if (!source) return text;
  return (
    <a href={source[0]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
      {text.slice(0, source.index).replace(/\s*·\s*$/, '')}
    </a>
  );
}

export function TripGuideCover({ stops }: { stops: Stop[] }) {
  const ref = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState<string[]>([]);
  const first = useFoundPlacePhotoDetails(photoPlace(stops[0]), ref, true);
  const second = useFoundPlacePhotoDetails(photoPlace(stops[1]), ref, true);
  const third = useFoundPlacePhotoDetails(photoPlace(stops[2]), ref, true);
  const index = [first, second, third].findIndex((photo) => photo.src && !failed.includes(photo.src));
  const selected = [first, second, third][index];
  return (
    <figure ref={ref} data-testid="trip-guide-cover" className={selected?.src ? 'mb-6' : 'min-h-px'}>
      {selected?.src && (
        <>
          <img
            src={selected.src}
            alt={stops[index].name}
            className="aspect-[16/9] max-h-80 w-full rounded-xl object-cover"
            onError={() => setFailed((previous) => [...previous, selected.src ?? ''])}
          />
          <figcaption className="mt-2 text-caption leading-relaxed text-content-muted [overflow-wrap:anywhere]">
            {stops[index].name}
            {selected.attribution && (
              <>
                {' · '}
                <PhotoCredit text={selected.attribution} />
              </>
            )}
          </figcaption>
        </>
      )}
    </figure>
  );
}

export function TripGuidePlace({ stop }: { stop: Stop }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLLIElement>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const photo = useFoundPlacePhotoDetails(photoPlace(stop), ref);
  const location = stop.location;
  const place = location ? { name: stop.name, ...location } : null;
  const mapsUrl =
    place && (isOutsideChina(place.lat, place.lng) ? getOpenStreetMapUrlForPlace(place) : getAmapUrlForPlace(place));
  return (
    <li ref={ref} className="py-4">
      {photo.src && photo.src !== failed && (
        <figure className="mb-3">
          <img
            src={photo.src}
            alt={stop.name}
            loading="lazy"
            className="mx-auto max-h-80 max-w-full rounded-xl object-contain"
            onError={() => setFailed(photo.src)}
          />
          {photo.attribution && (
            <figcaption className="mt-1 text-caption leading-relaxed text-content-muted [overflow-wrap:anywhere]">
              <PhotoCredit text={photo.attribution} />
            </figcaption>
          )}
        </figure>
      )}
      <h4 className="text-body font-semibold text-content [overflow-wrap:anywhere]">{stop.name}</h4>
      <p className="mb-2 mt-1 text-caption text-content-muted">
        {[
          stop.city,
          stop.duration_minutes > 0 ? t('dawarich.duration.minutes', { minutes: stop.duration_minutes }) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <p className="whitespace-pre-wrap text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]">
        {stop.description}
      </p>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center gap-2 text-body text-content-secondary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <MapPin size={16} aria-hidden="true" className="shrink-0" />
          <span className="[overflow-wrap:anywhere]">{location?.address || t('places.openInMaps')}</span>
        </a>
      )}
    </li>
  );
}
