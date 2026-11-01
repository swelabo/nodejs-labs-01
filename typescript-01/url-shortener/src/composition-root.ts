import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { requireLinkPort } from './ports.js'
import { createUseCases } from './usecases.js'
import { createApp } from './app.js'

export function composeApplication() {
  const database = createDatabase()
  const linkPort = requireLinkPort(createRepository(database))
  return { app: createApp({ useCases: createUseCases(linkPort) }), database }
}

