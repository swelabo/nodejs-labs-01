import { createDatabase } from './db.js'
import { createRepository } from './repository.js'
import { requireSnippetPort } from './ports.js'
import { createUseCases } from './usecases.js'
import { createApp } from './app.js'

export function composeApplication() {
  const database = createDatabase()
  const snippetPort = requireSnippetPort(createRepository(database))
  return { app: createApp({ useCases: createUseCases(snippetPort) }), database }
}
