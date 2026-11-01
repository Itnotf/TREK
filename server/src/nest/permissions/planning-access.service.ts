import { Trips } from '../../db/entities/Trips.entity';
import { DomainError } from '../common/domain-error';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

const FORMAL_ACTIONS = new Set(['day_edit', 'place_edit', 'reservation_edit', 'trip_edit']);

/** Trip planning roles never grant access to someone who has left the trip. */
@Injectable()
export class PlanningAccessService {
  constructor(private readonly em: EntityManager) {}

  async get(userId: number, tripId: number) {
    const result = await this.em.getRepository(Trips).planningAccess(tripId, userId);
    if (!result) throw new DomainError(404, 'Trip not found');
    const { trip, members, collaborators } = result;
    const isOwner = trip.user_id === userId;
    return { trip, isOwner, canConfirm: isOwner || collaborators.includes(userId), collaborators, members };
  }

  async requireConfirm(userId: number, tripId: number) {
    const access = await this.get(userId, tripId);
    if (!access.canConfirm) throw new DomainError(403, 'Only the trip owner or a planning collaborator can confirm');
    return access;
  }

  async requireOwner(userId: number, tripId: number) {
    const access = await this.get(userId, tripId);
    if (!access.isOwner) throw new DomainError(403, 'Only the trip owner can manage planning collaborators');
    return access;
  }

  async allowsFormalWrite(action: string, tripId: number, userId: number): Promise<boolean> {
    if (!FORMAL_ACTIONS.has(action)) return true;
    const managed = await this.em.getRepository(Trips).hasSharedPlanning(tripId);
    if (!managed) return true;
    return (await this.get(userId, tripId)).canConfirm;
  }
}
