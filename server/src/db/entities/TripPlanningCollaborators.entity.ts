import { EntityRepositoryType, type Opt, type Ref, defineEntity, p } from '@mikro-orm/core';
import { TripPlanningCollaboratorsRepository } from '../repositories/TripPlanningCollaborators.repository';
import { Trips } from './Trips.entity';
import { Users } from './Users.entity';

export class TripPlanningCollaborators {
  [EntityRepositoryType]?: TripPlanningCollaboratorsRepository;
  id!: number & Opt;
  trip!: Ref<Trips>;
  trip_id!: number;
  user!: Ref<Users>;
  user_id!: number;
}

export const TripPlanningCollaboratorsSchema = defineEntity({
  class: TripPlanningCollaborators,
  repository: () => TripPlanningCollaboratorsRepository,
  uniques: [{ properties: ['trip', 'user'] }],
  properties: {
    id: p.integer().primary(),
    trip: () => p.manyToOne(Trips).ref().deleteRule('cascade').hidden(),
    trip_id: p.integer().persist(false),
    user: () => p.manyToOne(Users).ref().deleteRule('cascade').hidden(),
    user_id: p.integer().persist(false),
  },
});
