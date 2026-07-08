import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'portfolio.db');

// Ensure data/ dir exists
mkdirSync(join(__dirname, '..', '..', 'data'), { recursive: true });

const db = new Database(DB_PATH);

// WAL mode — faster writes, safe concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS positions (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    symbol      TEXT,
    name        TEXT NOT NULL,
    asset_type  TEXT NOT NULL,
    mode        TEXT NOT NULL CHECK(mode IN ('auto','static')),
    quantity    REAL,
    static_value REAL,
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    snapshot_date   TEXT NOT NULL UNIQUE,
    total_value     REAL NOT NULL,
    positions_json  TEXT NOT NULL,
    week_change_pct REAL,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS season_log (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    logged_at   TEXT DEFAULT (datetime('now')),
    season      TEXT NOT NULL,
    phase       TEXT NOT NULL,
    confidence  REAL NOT NULL,
    scores      TEXT NOT NULL,
    fed_rate    REAL,
    yield_curve REAL
  );
`);

export default db;
