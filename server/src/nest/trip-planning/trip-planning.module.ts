import { TripPlanningCollaborators } from '../../db/entities/TripPlanningCollaborators.entity';
import { TripPlanningRevisions } from '../../db/entities/TripPlanningRevisions.entity';
import { AddonsModule } from '../addons/addons.module';
import { AiConnectionsModule } from '../ai-connections/ai-connections.module';
import { AssistantItineraryModule } from '../assistant/assistant-itinerary.module';
import { CollabModule } from '../collab/collab.module';
import { RateLimitModule } from '../common/rate-limit.module';
import { MapsModule } from '../maps/maps.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { TripPlanPublisherModule } from '../trips/trip-plan-publisher.module';
import { TripsModule } from '../trips/trips.module';
import { TripPlanningAiService } from './trip-planning-ai.service';
import { TripPlanningController, TripPlanningDraftController } from './trip-planning.controller';
import { TripPlanningService } from './trip-planning.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([TripPlanningRevisions, TripPlanningCollaborators]),
    AddonsModule,
    AiConnectionsModule,
    AssistantItineraryModule,
    CollabModule,
    RateLimitModule,
    MapsModule,
    PermissionsModule,
    RealtimeModule,
    TripsModule,
    TripPlanPublisherModule,
  ],
  controllers: [TripPlanningController, TripPlanningDraftController],
  providers: [TripPlanningService, TripPlanningAiService],
  exports: [TripPlanningService],
})
export class TripPlanningModule {}
