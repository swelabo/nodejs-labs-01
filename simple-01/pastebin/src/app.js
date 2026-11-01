import express from 'express'
import crypto from 'node:crypto'
import { ForbiddenError, NotFoundError, ValidationError, MAX_PAGE_SIZE } from './repository.js'
function problem(status, title, detail, errors) { return { type: 'about:blank', title, status, detail, ...(errors ? { errors } : {}) } }
function sendProblem(response, status, title, detail, errors) { return response.type('application/problem+json').status(status).json(problem(status, title, detail, errors)) }
function cookie(request, name) { return request.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) }
function userId(request, repository) { return repository.sessionUser(cookie(request, 'pastebin_session'))?.id || request.get('x-user-id') || null }
function page(value, fallback) { const n = Number.parseInt(value ?? '', 10); return Number.isInteger(n) && n > 0 ? n : fallback }
export function createApp({ repository, config }) {
  const app = express(); app.disable('x-powered-by'); app.use(express.static(new URL('./public', import.meta.url).pathname)); app.use(express.json({ limit: '128kb' }))
  app.use(express.urlencoded({ extended: false, limit: '128kb' }))
  app.set('view engine', 'ejs')
  app.set('views', new URL('./views', import.meta.url).pathname)
  app.use((request, response, next) => { const session = cookie(request, 'pastebin_session'); const supplied = request.get('x-csrf-token') || request.body?._csrf; if (session && ['POST', 'PATCH', 'DELETE'].includes(request.method) && !['/api/v1/auth/register', '/api/v1/auth/login'].includes(request.path) && supplied !== cookie(request, 'pastebin_csrf')) return sendProblem(response, 403, 'Forbidden', 'CSRF token is missing or invalid'); next() })
  app.post('/api/v1/auth/register', (request, response, next) => { try { const user = repository.register(request.body); const login = repository.login(request.body); const csrfToken = crypto.randomBytes(24).toString('base64url'); response.set('Set-Cookie', [`pastebin_session=${login.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`, `pastebin_csrf=${csrfToken}; SameSite=Lax; Path=/; Max-Age=86400`]); response.set('X-CSRF-Token', csrfToken); return response.status(201).json({ data: { user, expires_at: login.expires_at } }) } catch (error) { return next(error) } })
  app.post('/api/v1/auth/login', (request, response, next) => { try { const login = repository.login(request.body); const csrfToken = crypto.randomBytes(24).toString('base64url'); response.set('Set-Cookie', [`pastebin_session=${login.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`, `pastebin_csrf=${csrfToken}; SameSite=Lax; Path=/; Max-Age=86400`]); response.set('X-CSRF-Token', csrfToken); return response.json({ data: { user: login.user, expires_at: login.expires_at } }) } catch (error) { return next(error) } })
  app.post('/api/v1/auth/logout', (request, response) => { repository.logout(cookie(request, 'pastebin_session')); response.set('Set-Cookie', ['pastebin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0', 'pastebin_csrf=; SameSite=Lax; Path=/; Max-Age=0']); return response.status(204).end() })
  app.get('/', (request, response, next) => {
    try { return response.render('home', { snippets: repository.list({ query: '', page: 1, pageSize: 50 }).items, error: null, csrfToken: cookie(request, 'pastebin_csrf') }) } catch (error) { return next(error) }
  })
  app.post('/snippets', (request, response, next) => {
    try {
      const snippet = repository.create({ content: request.body.content, language: request.body.language, visibility: request.body.visibility, owner_id: userId(request, repository) })
      return response.redirect(303, `/snippets/${encodeURIComponent(snippet.id)}`)
    } catch (error) {
      if (error instanceof ValidationError) return response.status(400).render('home', { snippets: [], error: error.message, csrfToken: cookie(request, 'pastebin_csrf') })
      return next(error)
    }
  })
  app.get('/snippets/:id', (request, response, next) => {
    try { return response.render('snippet', { snippet: repository.read(request.params.id, userId(request, repository)) }) } catch (error) { return next(error) }
  })
  app.get('/api/v1/snippets', (request, response, next) => { try { return response.json(repository.list({ query: typeof request.query.q === 'string' ? request.query.q.slice(0, 100) : '', tag: typeof request.query.tag === 'string' ? request.query.tag.slice(0, 32) : undefined, page: page(request.query.page, 1), pageSize: Math.min(page(request.query.page_size, 20), MAX_PAGE_SIZE) })) } catch (error) { return next(error) } })
  app.post('/api/v1/snippets', (request, response, next) => { try { if (!config.allowAnonymousSubmissions && !userId(request, repository)) return sendProblem(response, 401, 'Unauthorized', 'A user identity is required'); return response.status(201).json({ data: repository.create({ ...request.body, owner_id: userId(request, repository) }) }) } catch (error) { return next(error) } })
  app.get('/api/v1/snippets/:id/raw', (request, response, next) => { try { return response.type('text/plain').send(repository.raw(request.params.id, userId(request, repository))) } catch (error) { return next(error) } })
  app.get('/api/v1/snippets/:id', (request, response, next) => { try { return response.json({ data: repository.read(request.params.id, userId(request, repository)) }) } catch (error) { return next(error) } })
  app.patch('/api/v1/snippets/:id', (request, response, next) => { try { return response.json({ data: repository.update(request.params.id, userId(request, repository), request.body) }) } catch (error) { return next(error) } })
  app.delete('/api/v1/snippets/:id', (request, response, next) => { try { repository.remove(request.params.id, userId(request, repository)); return response.status(204).end() } catch (error) { return next(error) } })
  app.get('/api/v1/admin/snippets', (request, response, next) => { try { if (!userId(request, repository)) return sendProblem(response, 401, 'Unauthorized', 'An authenticated account is required'); return response.json({ data: repository.adminSnippets() }) } catch (error) { return next(error) } })
  app.use((_request, response) => sendProblem(response, 404, 'Not Found', 'The requested resource was not found'))
  app.use((error, _request, response, _next) => { if (error instanceof ValidationError) return sendProblem(response, 400, 'Invalid request', error.message, error.errors); if (error instanceof NotFoundError) return sendProblem(response, 404, 'Not Found', error.message); if (error instanceof ForbiddenError) return sendProblem(response, 403, 'Forbidden', error.message); if (error.type === 'entity.too.large') return sendProblem(response, 413, 'Payload too large', 'The request body is too large'); console.error(error); return sendProblem(response, 500, 'Internal Server Error', 'The server could not complete the request') })
  return app
}

