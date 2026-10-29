import type { AssistantItineraryDrafts } from '../entities/AssistantItineraryDrafts.entity';
import type { DB } from '../kysely/db';
import { TrekRepository } from './_shared/trek-repository';

import type { Selectable } from 'kysely';

export type AssistantItineraryDraftRow = Selectable<DB['assistant_itinerary_drafts']>;
type DraftDB = Pick<DB, 'assistant_itinerary_drafts' | 'assistant_threads'>;

/** Every read is scoped to the owner of a home conversation. Plans are immutable after insertion. */
export class AssistantItineraryDraftsRepository extends TrekRepository<AssistantItineraryDrafts> {
  private owned(userId: number) {
    return this.kysely<DraftDB>()
      .selectFrom('assistant_itinerary_drafts as draft')
      .innerJoin('assistant_threads as thread', 'thread.id', 'draft.thread_id')
      .selectAll('draft')
      .where('thread.user_id', '=', userId)
      .where('thread.trip_id', 'is', null)
      .where('thread.journey_id', 'is', null);
  }

  async findOwned(userId: number, id: number): Promise<AssistantItineraryDraftRow | null> {
    return (await this.owned(userId).where('draft.id', '=', id).executeTakeFirst()) ?? null;
  }

  async latest(userId: number, threadId: number): Promise<AssistantItineraryDraftRow | null> {
    return (
      (await this.owned(userId)
        .where('draft.thread_id', '=', threadId)
        .orderBy('draft.revision', 'desc')
        .limit(1)
        .executeTakeFirst()) ?? null
    );
  }

  async insertRevision(threadId: number, revision: number, plan: string): Promise<number> {
    return this.insert({ thread: threadId, revision, plan });
  }

  async markApplied(id: number, tripId: number, at: string): Promise<void> {
    await this.nativeUpdate({ id }, { appliedTrip: tripId, applied_at: at });
  }
}
