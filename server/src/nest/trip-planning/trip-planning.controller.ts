import type { User } from '../../types';
import { CurrentUser } from '../auth-core/current-user.decorator';
import { JwtAuthGuard } from '../auth-core/jwt-auth.guard';
import { DomainError } from '../common/domain-error';
import { ManagedForbidden } from '../common/managed';
import { ResponseContract } from '../common/response-contract';
import { toRowId } from '../common/row-id';
import { TripPlanningService } from './trip-planning.service';
import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  tripPlanningAdoptRequestSchema,
  tripPlanningCollaboratorsRequestSchema,
  tripPlanningConfirmRequestSchema,
  tripPlanningGenerateRequestSchema,
  tripPlanningHistorySchema,
  tripPlanningShareDraftRequestSchema,
  tripPlanningShareDraftResponseSchema,
  tripPlanningStateSchema,
} from '@trek/shared';

import { createZodDto } from 'nestjs-zod';

export class TripPlanningGenerateDto extends createZodDto(tripPlanningGenerateRequestSchema) {}
export class TripPlanningConfirmDto extends createZodDto(tripPlanningConfirmRequestSchema) {}
export class TripPlanningCollaboratorsDto extends createZodDto(tripPlanningCollaboratorsRequestSchema) {}
export class TripPlanningAdoptDto extends createZodDto(tripPlanningAdoptRequestSchema) {}
export class TripPlanningShareDto extends createZodDto(tripPlanningShareDraftRequestSchema) {}

function idOf(value: string): number {
  const id = toRowId(value);
  if (id === null) throw new DomainError(400, 'Invalid identifier');
  return id;
}

@Controller('api/trips/:tripId/planning')
@UseGuards(JwtAuthGuard)
export class TripPlanningController {
  constructor(private readonly planning: TripPlanningService) {}

  @Get()
  @ResponseContract(tripPlanningStateSchema)
  read(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    return this.planning.read(user, idOf(tripId));
  }

  @Get('history')
  @ResponseContract(tripPlanningHistorySchema)
  history(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    return this.planning.history(user, idOf(tripId));
  }

  @Post('generate')
  @HttpCode(200)
  @ManagedForbidden('shared planning uses the instance or user AI connection')
  @ResponseContract(tripPlanningStateSchema)
  generate(@CurrentUser() user: User, @Param('tripId') tripId: string, @Body() body: TripPlanningGenerateDto) {
    return this.planning.generate(user, idOf(tripId), body);
  }

  @Post('confirm')
  @HttpCode(200)
  @ResponseContract(tripPlanningStateSchema)
  confirm(@CurrentUser() user: User, @Param('tripId') tripId: string, @Body() body: TripPlanningConfirmDto) {
    return this.planning.confirm(user, idOf(tripId), body.revision);
  }

  @Put('collaborators')
  @ResponseContract(tripPlanningStateSchema)
  collaborators(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Body() body: TripPlanningCollaboratorsDto,
  ) {
    return this.planning.setCollaborators(user, idOf(tripId), body.user_ids);
  }

  @Post('adopt')
  @HttpCode(200)
  @ResponseContract(tripPlanningStateSchema)
  adopt(@CurrentUser() user: User, @Param('tripId') tripId: string, @Body() body: TripPlanningAdoptDto) {
    return this.planning.adopt(user, idOf(tripId), body.draft_id, body.base_revision);
  }
}

/** Separate registration avoids sharing private assistant threads or making their module depend on planning. */
@Controller('api/assistant/itinerary-drafts')
@UseGuards(JwtAuthGuard)
export class TripPlanningDraftController {
  constructor(private readonly planning: TripPlanningService) {}

  @Post(':id/share')
  @HttpCode(200)
  @ResponseContract(tripPlanningShareDraftResponseSchema)
  share(@CurrentUser() user: User, @Param('id') id: string, @Body() body: TripPlanningShareDto) {
    return this.planning.sharePrivateDraft(user, idOf(id), body.revision);
  }
}
