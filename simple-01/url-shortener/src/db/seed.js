import { loadConfig } from '../config.js'
import { openDatabase } from './database.js'

const database = openDatabase(loadConfig().databasePath)
const now = new Date().toISOString()

database.prepare(`
  INSERT INTO links (alias, destination_url, owner_id, active, expires_at, created_at, updated_at)
  VALUES (@alias, @destinationUrl, @ownerId, 1, NULL, @now, @now)
  ON CONFLICT(alias) DO UPDATE SET destination_url = excluded.destination_url,
    owner_id = excluded.owner_id, active = excluded.active, updated_at = excluded.updated_at
`).run({
  alias: 'node',
  destinationUrl: 'https://nodejs.org',
  ownerId: loadConfig().developmentUserId,
  now,
})

database.close()
console.log('Seed data loaded')

