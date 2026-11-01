import { Migration } from '@mikro-orm/migrations';

export class Migration20200101046341_trip_plan_publications_keep_stable_activity_ids extends Migration {
  override name = 'Migration20200101046341_trip_plan_publications_keep_stable_activity_ids';

  override up(): void {
    this.addSql(`CREATE TABLE trip_plan_publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
      mapping TEXT NOT NULL
    )`);
  }
}
