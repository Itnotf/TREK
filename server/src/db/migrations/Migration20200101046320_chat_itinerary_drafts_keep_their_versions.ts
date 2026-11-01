import { Migration } from '@mikro-orm/migrations';

/** Draft revisions survive restarts; applying one keeps a receipt even if its trip is later deleted. */
export class Migration20200101046320_chat_itinerary_drafts_keep_their_versions extends Migration {
  override name = 'Migration20200101046320_chat_itinerary_drafts_keep_their_versions';

  override up(): void {
    this.addSql(`
      CREATE TABLE assistant_itinerary_drafts (
        id INTEGER PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
        revision INTEGER NOT NULL CHECK(revision > 0),
        plan TEXT NOT NULL,
        applied_trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
        applied_at DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(thread_id, revision)
      )
    `);
    this.addSql('CREATE INDEX idx_assistant_itinerary_drafts_trip ON assistant_itinerary_drafts(applied_trip_id)');
  }
}
