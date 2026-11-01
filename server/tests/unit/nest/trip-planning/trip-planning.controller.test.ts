import { JwtAuthGuard } from '../../../../src/nest/auth-core/jwt-auth.guard';
import { MANAGED_FORBIDDEN } from '../../../../src/nest/common/managed';
import { MANAGED_ROUTE_ALLOW_LIST } from '../../../../src/nest/common/validate-managed-routes';
import {
  TripPlanningController,
  TripPlanningDraftController,
} from '../../../../src/nest/trip-planning/trip-planning.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';

import { describe, expect, it } from 'vitest';

describe('shared planning route registration', () => {
  it('registers the managed AI restriction in the bootstrap inventory', () => {
    expect(Reflect.getMetadata(MANAGED_FORBIDDEN, TripPlanningController.prototype.generate)).toBeTruthy();
    expect(MANAGED_ROUTE_ALLOW_LIST).toContain('TripPlanningController.generate');
  });
  it('requires authentication on both shared trip and private adoption entry points', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, TripPlanningController)).toContain(JwtAuthGuard);
    expect(Reflect.getMetadata(GUARDS_METADATA, TripPlanningDraftController)).toContain(JwtAuthGuard);
  });
});
