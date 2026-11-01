import express from 'express'
import { ForbiddenError, NotFoundError, ValidationError } from './repository.js'
import { createUseCases } from './usecases.js'
import { DomainError } from './domain/errors.js'
function problem(status, title, detail) { return { type: 'about:blank', title, status, detail } }
export function createApp({ repository = undefined, useCases = createUseCases(repository), editorIds = new Set(['dev-editor']) }) {
  const app = express(); app.use(express.json()); const user = (q) => { const id = q.get('x-user-id'); return { id, role: id && editorIds.has(id) ? 'editor' : 'author' } }
  app.get('/api/v1/posts', async (_q, s, n) => { try { return s.json(await useCases.listPosts()) } catch (e) { return n(e) } })
  app.post('/api/v1/posts', async (q, s, n) => { try { const u = user(q); return s.status(201).json({ data: await useCases.createPost(u.id, u.role, q.body) }) } catch (e) { return n(e) } })
  app.get('/api/v1/posts/:slug', async (q, s, n) => { try { return s.json({ data: await useCases.readPost(q.params.slug) }) } catch (e) { return n(e) } })
  app.patch('/api/v1/posts/:id', async (q, s, n) => { try { const u = user(q); return s.json({ data: await useCases.updatePost(Number(q.params.id), u.id, u.role, q.body) }) } catch (e) { return n(e) } })
  app.use((_q, s) => s.status(404).json(problem(404, 'Not Found', 'The requested resource was not found')))
  app.use((e, _q, s, _n) => { if (e instanceof DomainError || e instanceof ValidationError) return s.status(400).json(problem(400, 'Invalid request', e.message)); if (e instanceof NotFoundError) return s.status(404).json(problem(404, 'Not Found', e.message)); if (e instanceof ForbiddenError) return s.status(403).json(problem(403, 'Forbidden', e.message)); console.error(e); return s.status(500).json(problem(500, 'Internal Server Error', 'The server could not complete the request')) })
  return app
}

