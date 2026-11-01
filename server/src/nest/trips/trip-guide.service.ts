import { TripItineraryGuides } from '../../db/entities/TripItineraryGuides.entity';
import { Trips } from '../../db/entities/Trips.entity';
import { TRIP_ITINERARY_GUIDE } from '../../db/json-columns';
import type { TripItineraryGuidesRepository } from '../../db/repositories/TripItineraryGuides.repository';
import type { TripsRepository } from '../../db/repositories/Trips.repository';
import { decodeJsonResult, encodeJson } from '../../utils/json-column';
import { AccommodationsService } from '../accommodations/accommodations.service';
import { DomainError } from '../common/domain-error';
import { toRowId } from '../common/row-id';
import { DaysService } from '../days/days.service';
import { ReservationsService } from '../reservations/reservations.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import {
  tripGuideCurrentSchema,
  type ItineraryPlan,
  type TripGuideCurrent,
  type TripGuideResponse,
} from '@trek/shared';

import { createHash } from 'node:crypto';

/** Trip data, independent of private chat access and AI availability. */
@Injectable()
export class TripGuideService {
  constructor(
    @InjectRepository(TripItineraryGuides) private readonly guides: TripItineraryGuidesRepository,
    @InjectRepository(Trips) private readonly trips: TripsRepository,
    private readonly days: DaysService,
    private readonly accommodations: AccommodationsService,
    private readonly reservations: ReservationsService,
  ) {}

  async get(userId: number, tripId: string | number): Promise<ItineraryPlan | null> {
    const id = toRowId(tripId);
    if (id === null || !(await this.trips.findAccessible(id, userId))) {
      throw new DomainError(404, 'Trip not found');
    }
    const stored = await this.guides.forTrip(id);
    if (stored === null) return null;
    const decoded = decodeJsonResult(TRIP_ITINERARY_GUIDE, stored);
    if (!decoded.ok || !decoded.value) throw new DomainError(500, 'Stored trip guide is invalid');
    return decoded.value;
  }

  async read(userId: number, tripId: string | number): Promise<TripGuideResponse> {
    // get checks current membership before either the original or live data is read.
    const plan = await this.get(userId, tripId);
    const id = toRowId(tripId)!;
    const current = await this.current(id);
    const baseline = plan ? await this.guides.baselineHash(id) : null;
    return {
      plan,
      current,
      status: baseline ? (baseline === tripGuideHash(current) ? 'unchanged' : 'changed') : 'unverified',
    };
  }

  /** Only the confirmed itinerary transaction calls this; its permission checks already passed. */
  async saveConfirmed(tripId: number, plan: ItineraryPlan): Promise<void> {
    const baseline = tripGuideHash(await this.current(tripId));
    await this.guides.saveConfirmed(tripId, encodeJson(TRIP_ITINERARY_GUIDE, plan), baseline);
  }

  private async current(tripId: number): Promise<TripGuideCurrent> {
    const trip = await this.trips.findRaw(tripId);
    if (!trip) throw new DomainError(404, 'Trip not found');
    const { days } = await this.days.list(tripId);
    const stays = await this.accommodations.list(tripId);
    // A stay can have several linked bookings; its itinerary entry is still one stay.
    const accommodations = [
      ...new Map(
        stays
          .sort((a, b) => a.id - b.id || (a.reservation_title ?? '').localeCompare(b.reservation_title ?? ''))
          .map((stay) => [stay.id, stay]),
      ).values(),
    ];
    return tripGuideCurrentSchema.parse({
      title: trip.title,
      start_date: trip.start_date,
      end_date: trip.end_date,
      currency: trip.currency ?? 'EUR',
      days,
      accommodations,
      reservations: (await this.reservations.list(tripId)).sort((a, b) => a.id - b.id),
    });
  }
}

const VOLATILE_FIELDS = new Set(['created_at', 'updated_at', 'external_synced_at', 'avatar', 'avatar_url']);

/** Sort object keys and omit audit/display churn; array order remains part of the itinerary. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !VOLATILE_FIELDS.has(key))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function tripGuideHash(current: TripGuideCurrent): string {
  return createHash('sha256')
    .update(JSON.stringify(canonical(current)))
    .digest('hex');
}
