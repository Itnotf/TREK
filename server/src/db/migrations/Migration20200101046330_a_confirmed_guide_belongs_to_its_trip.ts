import { Migration } from '@mikro-orm/migrations';

/** A confirmed guide survives deletion or retention of its private planning conversation. */
export class Migration20200101046330_a_confirmed_guide_belongs_to_its_trip extends Migration {
  override name = 'Migration20200101046330_a_confirmed_guide_belongs_to_its_trip';

  override up(): void {
    this.addSql(`
      CREATE TABLE trip_itinerary_guides (
        id INTEGER PRIMARY KEY,
        trip_id INTEGER NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
        plan TEXT NOT NULL
      )
    `);
  }
}
