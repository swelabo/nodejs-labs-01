import { createServer } from 'node:http'
import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { createApp } from './app.js'
const database = createDatabase(); createServer(createApp({ repository: createRepository(database) })).listen(Number(process.env.PORT || 3013))

