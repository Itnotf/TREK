import { EntityRepositoryType, type Opt, type Ref, defineEntity, p } from '@mikro-orm/core';
import { TripPlanningRevisionsRepository } from '../repositories/TripPlanningRevisions.repository';
import { DbTimestampType } from '../types';
import { AssistantItineraryDrafts } from './AssistantItineraryDrafts.entity';
import { Trips } from './Trips.entity';

export class TripPlanningRevisions {
  [EntityRepositoryType]?: TripPlanningRevisionsRepository;
  id!: number & Opt;
  trip!: Ref<Trips>;
  trip_id!: number;
  revision!: number;
  created_by!: number;
  content!: string;
  baseline_hash!: string;
  confirmed_at?: string | null;
  sourceDraft?: Ref<AssistantItineraryDrafts> | null;
  source_draft_id?: number | null;
  created_at!: string & Opt;
}

export const TripPlanningRevisionsSchema = defineEntity({
  class: TripPlanningRevisions,
  repository: () => TripPlanningRevisionsRepository,
  uniques: [{ properties: ['trip', 'revision'] }, { properties: ['sourceDraft'] }],
  properties: {
    id: p.integer().primary(),
    trip: () => p.manyToOne(Trips).ref().deleteRule('cascade').hidden(),
    trip_id: p.integer().persist(false),
    revision: p.integer(),
    created_by: p.integer(),
    content: p.text(),
    baseline_hash: p.text(),
    confirmed_at: p.type(DbTimestampType).nullable(),
    sourceDraft: () => p.manyToOne(AssistantItineraryDrafts).ref().nullable().hidden(),
    source_draft_id: p.integer().nullable().persist(false),
    created_at: p.type(DbTimestampType).defaultRaw(`CURRENT_TIMESTAMP`),
  },
});
