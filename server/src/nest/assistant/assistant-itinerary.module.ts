import { AssistantItineraryDrafts } from '../../db/entities/AssistantItineraryDrafts.entity';
import { AssistantThreads } from '../../db/entities/AssistantThreads.entity';
import { AccommodationsDomainModule } from '../accommodations/accommodations-domain.module';
import { AddonsModule } from '../addons/addons.module';
import { AssignmentsDomainModule } from '../assignments/assignments-domain.module';
import { DayNotesModule } from '../day-notes/day-notes.module';
import { DaysModule } from '../days/days.module';
import { McpSharedModule } from '../mcp-shared/mcp-shared.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PlacesModule } from '../places/places.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { TripsModule } from '../trips/trips.module';
import { AssistantItineraryController } from './assistant-itinerary.controller';
import { AssistantItineraryService } from './assistant-itinerary.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AccommodationsDomainModule,
    AddonsModule,
    AssignmentsDomainModule,
    DayNotesModule,
    DaysModule,
    McpSharedModule,
    PermissionsModule,
    PlacesModule,
    RealtimeModule,
    TripsModule,
    MikroOrmModule.forFeature([AssistantItineraryDrafts, AssistantThreads]),
  ],
  controllers: [AssistantItineraryController],
  providers: [AssistantItineraryService],
  exports: [AssistantItineraryService],
})
export class AssistantItineraryModule {}
