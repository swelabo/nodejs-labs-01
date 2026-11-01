import { loadConfig } from '../config.js'
import { openDatabase } from './database.js'

const database = openDatabase(loadConfig().databasePath)
const deleted = database.prepare("DELETE FROM snippets WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')").run().changes
database.close()
console.log(`Deleted ${deleted} expired snippets`)

