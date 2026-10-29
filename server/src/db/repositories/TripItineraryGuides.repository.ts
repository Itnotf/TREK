import type { TripItineraryGuides } from '../entities/TripItineraryGuides.entity';
import { TrekRepository } from './_shared/trek-repository';

export class TripItineraryGuidesRepository extends TrekRepository<TripItineraryGuides> {
  async forTrip(tripId: number): Promise<string | null> {
    const row = await this.findOne({ trip: tripId });
    return row?.plan ?? null;
  }

  async saveConfirmed(tripId: number, plan: string): Promise<void> {
    await this.insert({ trip: tripId, plan });
  }
}
