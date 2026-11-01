PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS links (
  alias TEXT PRIMARY KEY,
  destination_url TEXT NOT NULL,
  owner_id TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clicks (
  id INTEGER PRIMARY KEY,
  alias TEXT NOT NULL REFERENCES links(alias) ON DELETE CASCADE,
  occurred_at TEXT NOT NULL,
  referrer_host TEXT
);

CREATE INDEX IF NOT EXISTS clicks_alias_occurred_at
  ON clicks(alias, occurred_at);

