import type { TripPlanningRevisions } from '../entities/TripPlanningRevisions.entity';
import { TrekRepository } from './_shared/trek-repository';

export class TripPlanningRevisionsRepository extends TrekRepository<TripPlanningRevisions> {
  latest(tripId: number) {
    return this.findOne({ trip: tripId }, { orderBy: { revision: 'DESC' } });
  }
  confirmed(tripId: number) {
    return this.findOne({ trip: tripId, confirmed_at: { $ne: null } }, { orderBy: { revision: 'DESC' } });
  }
  history(tripId: number) {
    return this.find({ trip: tripId }, { orderBy: { revision: 'DESC' }, limit: 100 });
  }
  fromDraft(draftId: number) {
    return this.findOne({ sourceDraft: draftId });
  }
}
