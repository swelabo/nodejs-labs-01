import { createServer } from 'node:http'
import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { createApp } from './app.js'
import { createUseCases } from './usecases.js'
const database = createDatabase(); const repository = createRepository(database); const server = createServer(createApp({ repository, useCases: createUseCases(repository) })); const port = Number(process.env.PORT || 3021)
server.listen(port, () => console.log(`Prisma URL shortener listening on http://localhost:${port}`))
function shutdown(signal) { console.log(`Received ${signal}; shutting down`); server.close(async () => { await database.$disconnect(); process.exit(0) }) }
process.once('SIGINT', () => shutdown('SIGINT')); process.once('SIGTERM', () => shutdown('SIGTERM'))

