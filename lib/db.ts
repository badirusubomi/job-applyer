import Database from 'better-sqlite3';
import path from 'path';

// Local sqlite DB in the data directory
const dbPath = path.join(process.cwd(), 'data', 'app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    location TEXT,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_new BOOLEAN DEFAULT 1,
    applied BOOLEAN DEFAULT 0,
    FOREIGN KEY(source_id) REFERENCES sources(id)
  );
`);

export default db;
