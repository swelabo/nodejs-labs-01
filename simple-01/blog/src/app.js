import express from 'express'
import { ForbiddenError, NotFoundError, ValidationError, MAX_PAGE_SIZE, xml } from './repository.js'
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
  app.get('/api/v1/posts/:slug/comments/challenge', (request, response) => response.json({ data: (({ answer, ...publicChallenge }) => publicChallenge)(repository.issueChallenge()) }))
  app.post('/api/v1/posts/:slug/comments', (request, response, next) => { try { return response.status(201).json({ data: repository.createComment(request.params.slug, request.body) }) } catch (error) { return next(error) } })
  app.get('/api/v1/comments/pending', (request, response, next) => { try { const user = identity(request, config); return response.json({ data: repository.pendingComments(user.role) }) } catch (error) { return next(error) } })
  app.patch('/api/v1/comments/:id', (request, response, next) => { try { const user = identity(request, config); return response.json({ data: repository.moderateComment(Number(request.params.id), user.role, request.body.status) }) } catch (error) { return next(error) } })
  app.post('/api/v1/categories', (request, response, next) => { try { const user = identity(request, config); return response.status(201).json({ data: repository.createCategory(user.role, request.body) }) } catch (error) { return next(error) } })
  app.get('/api/v1/posts/:slug', (request, response, next) => { try { return response.json({ data: repository.publicBySlug(request.params.slug) }) } catch (error) { return next(error) } })
  app.get('/feed.xml', (request, response) => { const entries = repository.feed().map((post) => `<entry><title>${xml(post.title)}</title><link href="/posts/${xml(post.slug)}"/><updated>${xml(post.updated_at)}</updated><content>${xml(post.body)}</content></entry>`).join(''); return response.type('application/atom+xml').send(`<?xml version="1.0"?><feed><title>Engineering Blog</title>${entries}</feed>`) })
  app.get('/sitemap.xml', (request, response) => { const urls = repository.sitemap().map((post) => `<url><loc>/posts/${xml(post.slug)}</loc><lastmod>${xml(post.updated_at)}</lastmod></url>`).join(''); return response.type('application/xml').send(`<?xml version="1.0"?><urlset>${urls}</urlset>`) })
  app.patch('/api/v1/posts/:id', (request, response, next) => { try { const user = identity(request, config); return response.json({ data: repository.update(Number(request.params.id), user.id, user.role, request.body) }) } catch (error) { return next(error) } })
  app.use((_request, response) => sendProblem(response, 404, 'Not Found', 'The requested resource was not found'))
  app.use((error, _request, response, _next) => { if (error instanceof ValidationError) return sendProblem(response, 400, 'Invalid request', error.message, error.errors); if (error instanceof NotFoundError) return sendProblem(response, 404, 'Not Found', error.message); if (error instanceof ForbiddenError) return sendProblem(response, 403, 'Forbidden', error.message); if (error.type === 'entity.too.large') return sendProblem(response, 413, 'Payload too large', 'The request body is too large'); console.error(error); return sendProblem(response, 500, 'Internal Server Error', 'The server could not complete the request') })
  return app
}

