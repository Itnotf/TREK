import { EntityRepositoryType, type Opt, type Ref, defineEntity, p } from '@mikro-orm/core';
import { AssistantItineraryDraftsRepository } from '../repositories/AssistantItineraryDrafts.repository';
import { DbTimestampType } from '../types';
import { AssistantThreads } from './AssistantThreads.entity';
import { Trips } from './Trips.entity';

export class AssistantItineraryDrafts {
  [EntityRepositoryType]?: AssistantItineraryDraftsRepository;
  id!: number & Opt;
  thread!: Ref<AssistantThreads>;
  thread_id!: number;
  revision!: number;
  plan!: string;
  appliedTrip?: Ref<Trips> | null;
  applied_trip_id?: number | null;
  applied_at?: string | null;
  created_at!: string & Opt;
}

export const AssistantItineraryDraftsSchema = defineEntity({
  class: AssistantItineraryDrafts,
  repository: () => AssistantItineraryDraftsRepository,
  uniques: [{ properties: ['thread', 'revision'] }],
  properties: {
    id: p.integer().primary(),
    thread: () => p.manyToOne(AssistantThreads).ref().deleteRule('cascade').hidden(),
    thread_id: p.integer().persist(false),
    revision: p.integer(),
    plan: p.text(),
    appliedTrip: () => p.manyToOne(Trips).ref().nullable().hidden().index('idx_assistant_itinerary_drafts_trip'),
    applied_trip_id: p.integer().nullable().persist(false).index('idx_assistant_itinerary_drafts_trip'),
    applied_at: p.type(DbTimestampType).nullable(),
    created_at: p.type(DbTimestampType).defaultRaw(`CURRENT_TIMESTAMP`),
  },
});
