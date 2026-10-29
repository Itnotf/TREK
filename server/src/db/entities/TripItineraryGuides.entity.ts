import { EntityRepositoryType, type Opt, type Ref, defineEntity, p } from '@mikro-orm/core';
import { TripItineraryGuidesRepository } from '../repositories/TripItineraryGuides.repository';
import { Trips } from './Trips.entity';

export class TripItineraryGuides {
  [EntityRepositoryType]?: TripItineraryGuidesRepository;
  id!: number & Opt;
  trip!: Ref<Trips>;
  trip_id!: number;
  plan!: string;
}

export const TripItineraryGuidesSchema = defineEntity({
  class: TripItineraryGuides,
  repository: () => TripItineraryGuidesRepository,
  uniques: [{ properties: ['trip'] }],
  properties: {
    id: p.integer().primary(),
    trip: () => p.manyToOne(Trips).ref().deleteRule('cascade').hidden(),
    trip_id: p.integer().persist(false),
    plan: p.text(),
  },
});
