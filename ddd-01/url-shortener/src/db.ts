import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../generated/prisma/index.js'

export function createDatabase(databaseUrl = process.env.DATABASE_URL ?? 'file:./data/url-shortener.db') {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) })
}

