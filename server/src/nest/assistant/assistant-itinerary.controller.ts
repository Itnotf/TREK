import { ADDON_IDS } from '../../addons';
import type { User } from '../../types';
import { AddonGuard } from '../addons/addon.guard';
import { RequireAddon } from '../addons/require-addon.decorator';
import { CurrentUser } from '../auth-core/current-user.decorator';
import { JwtAuthGuard } from '../auth-core/jwt-auth.guard';
import { ManagedForbidden } from '../common/managed';
import { ResponseContract } from '../common/response-contract';
import { AssistantItineraryService } from './assistant-itinerary.service';
import { idParam } from './assistant.controller';
import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { itineraryApplyRequestSchema, itineraryApplyResponseSchema, itineraryDraftResponseSchema } from '@trek/shared';

import { createZodDto } from 'nestjs-zod';

class ItineraryApplyDto extends createZodDto(itineraryApplyRequestSchema) {}

@Controller('api/assistant/itinerary-drafts')
@UseGuards(AddonGuard, JwtAuthGuard)
@RequireAddon(ADDON_IDS.AI_ASSISTANT, 'AI assistant')
@ManagedForbidden('the operator decides which model a managed install talks to, and pays for it')
export class AssistantItineraryController {
  constructor(private readonly itineraries: AssistantItineraryService) {}

  @Get(':id')
  @ResponseContract(itineraryDraftResponseSchema)
  async get(@CurrentUser() user: User, @Param('id') id: string) {
    return { draft: await this.itineraries.get(user.id, idParam(id)) };
  }

  @Post(':id/apply')
  @HttpCode(200)
  @ResponseContract(itineraryApplyResponseSchema)
  apply(@CurrentUser() user: User, @Param('id') id: string, @Body() body: ItineraryApplyDto) {
    return this.itineraries.apply(user.id, idParam(id), body);
  }
}
