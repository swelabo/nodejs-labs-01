import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
export function createDatabase(url = process.env.NODE_ENV === 'test' ? 'file:./data/test.db' : process.env.DATABASE_URL ?? 'file:./data/blog.db') { return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) }) }

