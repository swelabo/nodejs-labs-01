import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')
export function openDatabase(databasePath) {
  if (databasePath !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true })
  const database = new Database(databasePath)
  database.pragma('foreign_keys = ON')
  database.exec(schema)
  return database
}

