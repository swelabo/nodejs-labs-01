import { loadConfig } from '../config.js'
import { openDatabase } from './database.js'

const database = openDatabase(loadConfig().databasePath)
database.prepare(`INSERT INTO users (id, slug, display_name, role) VALUES ('seed-editor', 'seed-editor', 'Seed Editor', 'editor')
  ON CONFLICT(id) DO UPDATE SET role = excluded.role`).run()
database.prepare(`INSERT INTO posts (slug, title, body, author_id, status, publish_at, created_at, updated_at)
  VALUES ('seed-post', 'Seed post', 'Seed content', 'seed-editor', 'published', NULL, datetime('now'), datetime('now'))
  ON CONFLICT(slug) DO UPDATE SET title = excluded.title, body = excluded.body`).run()
database.close()
console.log('Seed data loaded for blog')
