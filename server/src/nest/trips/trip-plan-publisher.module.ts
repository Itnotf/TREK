import { DaysModule } from '../days/days.module';
import { FilesModule } from '../files/files.module';
import { PlacesModule } from '../places/places.module';
import { TripsModule } from '../trips/trips.module';
import { TripPlanPublisher } from './trip-plan-publisher.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TripsModule, DaysModule, PlacesModule, FilesModule],
  providers: [TripPlanPublisher],
  exports: [TripPlanPublisher],
})
export class TripPlanPublisherModule {}
