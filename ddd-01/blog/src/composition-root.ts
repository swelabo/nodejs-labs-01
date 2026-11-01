import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { requirePostPort } from './ports.js'
import { createUseCases } from './usecases.js'
import { createApp } from './app.js'
import { createTransactionBoundary } from './application/transaction.js'

export function composeApplication() {
  const database = createDatabase()
  const postPort = requirePostPort(createRepository(database))
  return { app: createApp({ useCases: createUseCases(postPort) }), database, transaction: createTransactionBoundary(database) }
}
