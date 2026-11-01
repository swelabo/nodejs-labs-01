import { createServer } from 'node:http'
import { composeApplication } from './composition-root.js'
const { app, database } = composeApplication(); const server = createServer(app); const port = Number(process.env.PORT || 3031)
server.listen(port, () => console.log(`Prisma URL shortener listening on http://localhost:${port}`))
function shutdown(signal) { console.log(`Received ${signal}; shutting down`); server.close(async () => { await database.$disconnect(); process.exit(0) }) }
process.once('SIGINT', () => shutdown('SIGINT')); process.once('SIGTERM', () => shutdown('SIGTERM'))

