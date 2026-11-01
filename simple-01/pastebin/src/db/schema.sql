PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS snippets (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) <= 100000),
  owner_id TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'private')),
  language TEXT NOT NULL DEFAULT 'text',
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  snippet_id TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (snippet_id, tag)
);

CREATE INDEX IF NOT EXISTS snippets_created_at ON snippets(created_at);
CREATE INDEX IF NOT EXISTS tags_tag ON tags(tag);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

