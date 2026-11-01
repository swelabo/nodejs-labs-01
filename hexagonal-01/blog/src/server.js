import { createServer } from 'node:http'
import { composeApplication } from './composition-root.js'
const { app, database } = composeApplication()
const server = createServer(app)
server.listen(Number(process.env.PORT || 3013))
process.on('SIGTERM', () => { server.close(() => database.close()) })

