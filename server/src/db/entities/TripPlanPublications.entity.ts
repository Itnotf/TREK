import { EntityRepositoryType, type Opt, type Ref, defineEntity, p } from '@mikro-orm/core';
import { TripPlanPublicationsRepository } from '../repositories/TripPlanPublications.repository';
import { Trips } from './Trips.entity';

export class TripPlanPublications {
  [EntityRepositoryType]?: TripPlanPublicationsRepository;
  id!: number & Opt;
  trip!: Ref<Trips>;
  trip_id!: number;
  mapping!: string;
}

export const TripPlanPublicationsSchema = defineEntity({
  class: TripPlanPublications,
  repository: () => TripPlanPublicationsRepository,
  uniques: [{ properties: ['trip'] }],
  properties: {
    id: p.integer().primary(),
    trip: () => p.manyToOne(Trips).ref().deleteRule('cascade').hidden(),
    trip_id: p.integer().persist(false),
    mapping: p.text(),
  },
});
