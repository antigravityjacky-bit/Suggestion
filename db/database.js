import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'racing.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    race_count INTEGER NOT NULL,
    label      TEXT
  );

  CREATE TABLE IF NOT EXISTS races (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    race_number INTEGER NOT NULL,
    xiaomei_1   INTEGER,
    xiaomei_2   INTEGER,
    xiaomei_3   INTEGER,
    xiaomei_4   INTEGER,
    mingye_1    INTEGER,
    mingye_2    INTEGER,
    mingye_3    INTEGER,
    mingye_4    INTEGER,
    mingjia_1   INTEGER
  );

  CREATE TABLE IF NOT EXISTS click_states (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id     INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    slot_index  INTEGER NOT NULL,
    click_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(race_id, slot_index)
  );

  CREATE TABLE IF NOT EXISTS horsestat (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    horse_1 INTEGER,
    horse_2 INTEGER,
    horse_3 INTEGER,
    horse_4 INTEGER,
    UNIQUE(race_id)
  );
`);

export default db;
