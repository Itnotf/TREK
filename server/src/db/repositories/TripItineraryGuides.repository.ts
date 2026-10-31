import type { TripItineraryGuides } from '../entities/TripItineraryGuides.entity';
import { TrekRepository } from './_shared/trek-repository';

export class TripItineraryGuidesRepository extends TrekRepository<TripItineraryGuides> {
  async forTrip(tripId: number): Promise<string | null> {
    const row = await this.findOne({ trip: tripId });
    return row?.plan ?? null;
  }

  async baselineHash(tripId: number): Promise<string | null> {
    const row = await this.findOne({ trip: tripId });
    return row?.baseline_hash ?? null;
  }

  async saveConfirmed(tripId: number, plan: string, baseline_hash: string): Promise<void> {
    const previous = await this.findOne({ trip: tripId });
    if (previous) await this.nativeUpdate({ id: previous.id }, { plan, baseline_hash });
    else await this.insert({ trip: tripId, plan, baseline_hash });
  }
}
