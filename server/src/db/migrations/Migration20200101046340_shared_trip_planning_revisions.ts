import { Migration } from '@mikro-orm/migrations';

/** Plans belong to the trip; deleting a private conversation only removes its source link. */
export class Migration20200101046340_shared_trip_planning_revisions extends Migration {
  override name = 'Migration20200101046340_shared_trip_planning_revisions';
  override up(): void {
    this.addSql(`CREATE TABLE trip_planning_revisions (
      id INTEGER PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      revision INTEGER NOT NULL CHECK(revision > 0),
      created_by INTEGER NOT NULL,
      content TEXT NOT NULL,
      baseline_hash TEXT NOT NULL,
      confirmed_at DATETIME,
      source_draft_id INTEGER UNIQUE REFERENCES assistant_itinerary_drafts(id) ON DELETE SET NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trip_id, revision)
    )`);
    this.addSql(`CREATE TABLE trip_planning_collaborators (
      id INTEGER PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(trip_id, user_id)
    )`);
  }
}
