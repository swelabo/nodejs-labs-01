import { createServer } from 'node:http'

import { loadConfig } from './config.js'
import { openDatabase } from './db/database.js'
import { createRepository } from './repository.js'
import { createApp } from './app.js'

const config = loadConfig()
const database = openDatabase(config.databasePath)
const app = createApp({ repository: createRepository(database), config })
const server = createServer(app)

server.listen(config.port, () => {
  console.log(`URL shortener listening on http://localhost:${config.port}`)
})

function shutdown(signal) {
  console.log(`Received ${signal}; shutting down`)
  server.close(() => {
    database.close()
    process.exit(0)
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))

