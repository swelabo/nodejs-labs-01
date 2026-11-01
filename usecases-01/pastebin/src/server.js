import { createServer } from 'node:http'
import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { createApp } from './app.js'
const database = createDatabase(); const server = createServer(createApp({ repository: createRepository(database) })); server.listen(Number(process.env.PORT || 3012))

