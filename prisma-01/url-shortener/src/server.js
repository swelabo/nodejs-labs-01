import { createServer } from 'node:http'
import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { createApp } from './app.js'
const database = createDatabase(); const server = createServer(createApp({ repository: createRepository(database) })); const port = Number(process.env.PORT || 3011)
server.listen(port, () => console.log(`Prisma URL shortener listening on http://localhost:${port}`))
function shutdown(signal) { console.log(`Received ${signal}; shutting down`); server.close(async () => { await database.$disconnect(); process.exit(0) }) }
process.once('SIGINT', () => shutdown('SIGINT')); process.once('SIGTERM', () => shutdown('SIGTERM'))

