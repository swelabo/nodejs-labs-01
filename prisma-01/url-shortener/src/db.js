import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../generated/prisma/index.js'

export function createDatabase(databaseUrl = process.env.DATABASE_URL ?? 'file:./data/url-shortener.db') {
  // Prisma 7 can require a TypeScript config while the application remains
  // JavaScript. The adapter connects Prisma's generated client to SQLite; it
  // does not move authorization or domain rules into the ORM.
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) })
}

