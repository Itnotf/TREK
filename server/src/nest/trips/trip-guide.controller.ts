import type { User } from '../../types';
import { CurrentUser } from '../auth-core/current-user.decorator';
import { JwtAuthGuard } from '../auth-core/jwt-auth.guard';
import { ResponseContract } from '../common/response-contract';
import { TripGuideService } from './trip-guide.service';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { tripGuideResponseSchema } from '@trek/shared';

@Controller('api/trips/:tripId/guide')
@UseGuards(JwtAuthGuard)
export class TripGuideController {
  constructor(private readonly guides: TripGuideService) {}

  @Get()
  @ResponseContract(tripGuideResponseSchema)
  async get(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    return this.guides.read(user.id, tripId);
  }
}
