import { TripItineraryGuides } from '../../db/entities/TripItineraryGuides.entity';
import { Trips } from '../../db/entities/Trips.entity';
import { TRIP_ITINERARY_GUIDE } from '../../db/json-columns';
import type { TripItineraryGuidesRepository } from '../../db/repositories/TripItineraryGuides.repository';
import type { TripsRepository } from '../../db/repositories/Trips.repository';
import { decodeJsonResult, encodeJson } from '../../utils/json-column';
import { DomainError } from '../common/domain-error';
import { toRowId } from '../common/row-id';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import type { ItineraryPlan } from '@trek/shared';

/** Trip data, independent of private chat access and AI availability. */
@Injectable()
export class TripGuideService {
  constructor(
    @InjectRepository(TripItineraryGuides) private readonly guides: TripItineraryGuidesRepository,
    @InjectRepository(Trips) private readonly trips: TripsRepository,
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

  /** Only the confirmed itinerary transaction calls this; its permission checks already passed. */
  async saveConfirmed(tripId: number, plan: ItineraryPlan): Promise<void> {
    await this.guides.saveConfirmed(tripId, encodeJson(TRIP_ITINERARY_GUIDE, plan));
  }
}
