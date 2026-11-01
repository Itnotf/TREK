import { Migration } from '@mikro-orm/migrations';

/** Older guides cannot prove that their prose still describes the current trip. */
export class Migration20200101046331_a_guide_records_its_confirmed_trip extends Migration {
  override name = 'Migration20200101046331_a_guide_records_its_confirmed_trip';

  override up(): void {
    this.addSql('ALTER TABLE trip_itinerary_guides ADD COLUMN baseline_hash TEXT');
  }
}
