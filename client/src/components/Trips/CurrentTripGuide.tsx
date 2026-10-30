import type { Assignment, DayNote, ItineraryPlan, Reservation, TripGuideCurrent } from '@trek/shared';
import { useId, useRef } from 'react';

import { useTranslation } from '../../i18n';
import { getDisplayTimeForDay, getMergedItems, getTransportForDay, stopDayIds } from '../../utils/dayMerge';
import { getDayBookendHotels } from '../../utils/dayOrder';
import { useFoundPlacePhoto } from '../Assistant/useFoundPlacePhoto';

const prose = 'whitespace-pre-wrap text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]';
const summary =
  'min-h-11 cursor-pointer content-center text-body font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function PlaceDetails({ assignment }: { assignment: Assignment }) {
  const { t } = useTranslation();
  const place = assignment.place;
  const ref = useRef<HTMLDivElement>(null);
  const photo = useFoundPlacePhoto(
    { name: place.name, lat: place.lat, lng: place.lng, photoKey: place.google_place_id || place.osm_id },
    ref
  );
  const start = assignment.assignment_time ?? place.place_time;
  const end = assignment.assignment_end_time ?? place.end_time;
  return (
    <div ref={ref} className="flow-root">
      {photo && (
        <img src={photo} alt="" loading="lazy" className="float-end mb-2 ms-3 h-20 w-24 rounded-lg object-cover" />
      )}
      <h3 className="text-body font-semibold text-content [overflow-wrap:anywhere]">{place.name}</h3>
      <p className="mt-1 text-caption tabular-nums text-content-muted">
        {[
          start && `${start}${end ? ` – ${end}` : ''}`,
          place.address,
          place.duration_minutes ? t('dawarich.duration.minutes', { minutes: place.duration_minutes }) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {place.description && <p className={`mt-2 ${prose}`}>{place.description}</p>}
      {assignment.notes && <p className={`mt-2 ${prose}`}>{assignment.notes}</p>}
    </div>
  );
}

function BookingDetails({ booking, dayId }: { booking: Reservation; dayId?: number }) {
  const { t } = useTranslation();
  return (
    <div className="py-3">
      <h3 className="text-body font-semibold [overflow-wrap:anywhere]">{booking.title}</h3>
      <p className="mt-1 text-caption tabular-nums text-content-muted">
        {[
          dayId ? getDisplayTimeForDay(booking, dayId) : booking.reservation_time,
          booking.location,
          t(booking.status === 'confirmed' ? 'reservations.confirmed' : 'reservations.pending'),
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {booking.notes && <p className={`mt-2 ${prose}`}>{booking.notes}</p>}
    </div>
  );
}

/** Reads the same stored activities, stays and bookings as the daily itinerary. */
export default function CurrentTripGuide({
  current,
  original,
}: {
  current: TripGuideCurrent;
  original: ItineraryPlan | null;
}) {
  const { t } = useTranslation();
  const prefix = useId();
  const stopDays = stopDayIds(Object.fromEntries(current.days.map((day) => [day.id, day.assignments ?? []])));
  const originalStops = original?.days.flatMap((day) => day.stops) ?? [];
  const kind = (a: Assignment) => {
    if (a.place.stop_type === 'restaurant') return 'meal';
    if (a.place.stop_type === 'rest_area') return 'rest';
    const matches = originalStops.filter((stop) => stop.name === a.place.name);
    return matches.length === 1 ? matches[0].kind : 'activity';
  };
  return (
    <div className="min-w-0 text-content">
      <nav aria-label={t('trip.guide.days')} className="flex flex-wrap gap-2 border-y border-edge-faint py-3">
        {current.days.map((day, index) => (
          <a
            key={day.id}
            href={`#${prefix}-day-${day.id}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-surface-secondary px-3 text-body font-medium hover:bg-surface-tertiary focus-visible:outline focus-visible:outline-2"
          >
            {t('planner.dayN', { n: index + 1 })}
          </a>
        ))}
      </nav>
      {current.days.map((day, index) => {
        const assignments = (day.assignments ?? []).filter((a) => a.accommodation_id == null);
        const visits = assignments.filter((a) => ['visit', 'activity', undefined].includes(kind(a)));
        const meals = assignments.filter((a) => kind(a) === 'meal');
        const bookings = getTransportForDay({
          reservations: current.reservations,
          dayId: day.id,
          dayAssignmentIds: [],
          days: current.days,
          stopDays,
        }) as Reservation[];
        const items = getMergedItems({
          dayAssignments: assignments,
          dayNotes: day.notes_items ?? [],
          dayTransports: bookings,
          dayId: day.id,
        });
        const { morning, evening } = getDayBookendHotels(day, current.days, current.accommodations);
        const stayNotes = (day.notes_items ?? []).filter((note) => note.icon === 'BedDouble');
        const title = day.title?.replace(/^(?:第[0-9一二三四五六七八九十]+天|day\s*\d+)\s*[·|｜:：\-–—]?\s*/i, '');
        return (
          <section key={day.id} id={`${prefix}-day-${day.id}`} className="scroll-mt-24 border-b border-edge-faint py-6">
            <h2 className="text-lg font-semibold leading-snug [overflow-wrap:anywhere]">
              {t('planner.dayN', { n: index + 1 })}
              {title && ` · ${title}`}
            </h2>
            {day.date && <p className="mt-2 text-caption text-content-muted">{day.date}</p>}
            <p className="mt-3 text-body font-medium leading-relaxed [overflow-wrap:anywhere]">
              {assignments.map((a) => a.place.name).join(' → ')}
            </p>
            {!items.length && !morning && !evening && <p className={`mt-3 ${prose}`}>{t('planner.noPlacesForDay')}</p>}
            <ul className="mt-2 divide-y divide-edge-faint">
              {visits.map((a) => (
                <li key={a.id} className="py-4">
                  <PlaceDetails assignment={a} />
                </li>
              ))}
            </ul>
            {!!meals.length && (
              <div className="py-3">
                <h3 className="mb-2 text-body font-semibold">{t('trip.guide.dining')}</h3>
                <ul className="divide-y divide-edge-faint">
                  {meals.map((a) => (
                    <li key={a.id} className="py-3">
                      <PlaceDetails assignment={a} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(morning || evening || stayNotes.length > 0) && (
              <div className="py-3">
                <h3 className="mb-2 text-body font-semibold">{t('trip.guide.stay')}</h3>
                {morning && morning.id !== evening?.id && (
                  <p className="text-body">
                    {t('reservations.meta.checkOut')} · {morning.place_name} {morning.check_out}
                  </p>
                )}
                {evening && (
                  <>
                    <p className="text-body font-medium">{evening.place_name}</p>
                    <p className="mt-1 text-caption text-content-muted">
                      {t('reservations.meta.checkIn')} {evening.check_in}
                    </p>
                    {evening.notes && <p className={`mt-2 ${prose}`}>{evening.notes}</p>}
                  </>
                )}
                {stayNotes.map((note) => (
                  <p key={note.id} className={`mt-2 ${prose}`}>
                    {note.text}
                  </p>
                ))}
              </div>
            )}
            <details className="mt-3 border-t border-edge-faint pt-1">
              <summary className={summary}>{t('trip.guide.schedule')}</summary>
              <ol className="divide-y divide-edge-faint">
                {items.map((item) => {
                  if (item.type === 'place') {
                    const a = item.data as Assignment;
                    return (
                      <li key={`place-${a.id}`} className="py-3">
                        <PlaceDetails assignment={a} />
                      </li>
                    );
                  }
                  if (item.type === 'note') {
                    const note = item.data as DayNote;
                    return (
                      <li key={`note-${note.id}`} className="py-3">
                        <p className={prose}>{note.text}</p>
                        {note.time && <p className={`mt-1 ${prose}`}>{note.time}</p>}
                      </li>
                    );
                  }
                  const booking = item.data as Reservation;
                  return (
                    <li key={`booking-${booking.id}-${item.sortKey}`}>
                      <BookingDetails booking={booking} dayId={day.id} />
                    </li>
                  );
                })}
              </ol>
              {day.notes && <p className={`py-3 ${prose}`}>{day.notes}</p>}
            </details>
          </section>
        );
      })}
      {!!current.reservations.length && (
        <section className="py-6">
          <h2 className="text-lg font-semibold">{t('trip.tabs.reservations')}</h2>
          {current.reservations.map((booking) => (
            <BookingDetails key={booking.id} booking={booking} />
          ))}
        </section>
      )}
    </div>
  );
}
