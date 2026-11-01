PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

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
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

