import express from 'express'
import { ForbiddenError, NotFoundError, ValidationError, MAX_PAGE_SIZE } from './repository.js'
function problem(status, title, detail, errors) { return { type: 'about:blank', title, status, detail, ...(errors ? { errors } : {}) } }
function sendProblem(response, status, title, detail, errors) { return response.type('application/problem+json').status(status).json(problem(status, title, detail, errors)) }
function identity(request, config) { const id = request.get('x-user-id'); return { id, role: id && config.editorUserIds.has(id) ? 'editor' : 'author' } }
function page(value, fallback) { const n = Number.parseInt(value ?? '', 10); return Number.isInteger(n) && n > 0 ? n : fallback }
export function createApp({ repository, config }) {
  const app = express(); app.disable('x-powered-by'); app.use(express.json({ limit: '256kb' })); app.use(express.urlencoded({ extended: false, limit: '256kb' })); app.set('view engine', 'ejs'); app.set('views', new URL('./views', import.meta.url).pathname)
  app.get('/', (request, response, next) => { try { return response.render('home', { posts: repository.list({ page: 1, pageSize: 20 }).items }) } catch (error) { return next(error) } })
  app.get('/posts/:slug', (request, response, next) => { try { return response.render('post', { post: repository.publicBySlug(request.params.slug) }) } catch (error) { return next(error) } })
  app.get('/api/v1/posts', (request, response, next) => { try { return response.json(repository.list({ query: typeof request.query.q === 'string' ? request.query.q.slice(0, 100) : '', tag: request.query.tag, category: request.query.category, page: page(request.query.page, 1), pageSize: Math.min(page(request.query.page_size, 20), MAX_PAGE_SIZE) })) } catch (error) { return next(error) } })
  app.post('/api/v1/posts', (request, response, next) => { try { const user = identity(request, config); return response.status(201).json({ data: repository.create(user.id, user.role, request.body) }) } catch (error) { return next(error) } })
  app.get('/api/v1/posts/:slug', (request, response, next) => { try { return response.json({ data: repository.publicBySlug(request.params.slug) }) } catch (error) { return next(error) } })
  app.patch('/api/v1/posts/:id', (request, response, next) => { try { const user = identity(request, config); return response.json({ data: repository.update(Number(request.params.id), user.id, user.role, request.body) }) } catch (error) { return next(error) } })
  app.use((_request, response) => sendProblem(response, 404, 'Not Found', 'The requested resource was not found'))
  app.use((error, _request, response, _next) => { if (error instanceof ValidationError) return sendProblem(response, 400, 'Invalid request', error.message, error.errors); if (error instanceof NotFoundError) return sendProblem(response, 404, 'Not Found', error.message); if (error instanceof ForbiddenError) return sendProblem(response, 403, 'Forbidden', error.message); if (error.type === 'entity.too.large') return sendProblem(response, 413, 'Payload too large', 'The request body is too large'); console.error(error); return sendProblem(response, 500, 'Internal Server Error', 'The server could not complete the request') })
  return app
}

