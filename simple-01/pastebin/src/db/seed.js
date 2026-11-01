import { loadConfig } from '../config.js'
import { openDatabase } from './database.js'

const database = openDatabase(loadConfig().databasePath)
database.prepare(`INSERT INTO snippets (id, content, owner_id, visibility, language, expires_at, created_at, updated_at)
  VALUES ('seed-snippet', 'Seed snippet', 'seed-user', 'public', 'text', NULL, datetime('now'), datetime('now'))
  ON CONFLICT(id) DO UPDATE SET content = excluded.content`).run()
database.close()
console.log('Seed data loaded for pastebin')
