import express from 'express'
import QRCode from 'qrcode'

import { createRepository, ForbiddenError, NotFoundError, ValidationError, MAX_PAGE_SIZE } from './repository.js'

function problem(status, title, detail, errors) {
  return { type: 'about:blank', title, status, detail, ...(errors ? { errors } : {}) }
}

function sendProblem(response, status, title, detail, errors) {
  return response.type('application/problem+json').status(status).json(problem(status, title, detail, errors))
}

function userIdFrom(request, config) {
  // The development header is an explicit identity seam. Falling back to a
  // configured user would turn an anonymous request into an authorized one.
  return request.get('x-user-id') || (config.allowAnonymousCreation ? null : null)
}

function parsePage(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function createRateLimiter(limit, windowMs = 60_000) {
  const clients = new Map()
  return (request, response, next) => {
    const now = Date.now()
    const key = request.ip || 'unknown'
    const current = clients.get(key)
    if (!current || now >= current.resetAt) {
      clients.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
    current.count += 1
    if (current.count > limit) {
      response.set('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)))
      return sendProblem(response, 429, 'Too Many Requests', 'Rate limit exceeded')
    }
    return next()
  }
}

export function createApp({ repository, config }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '16kb' }))
  app.use(express.urlencoded({ extended: false, limit: '16kb' }))
  app.set('view engine', 'ejs')
  app.set('views', new URL('./views', import.meta.url).pathname)
  const limitCreation = createRateLimiter(config.rateLimitPerMinute)

  app.get('/', (request, response, next) => {
    try {
      const ownerId = userIdFrom(request, config)
      const links = repository.list({ ownerId, page: 1, pageSize: 100 }).items
      return response.render('home', { links, error: null, userId: ownerId })
    } catch (error) {
      return next(error)
    }
  })

  app.post('/links', (request, response, next) => {
    try {
      const ownerId = userIdFrom(request, config)
      const link = repository.create({ ...request.body, owner_id: ownerId })
      if (request.get('hx-request') === 'true') {
        return response.render('link-row', { link, userId: ownerId })
      }
      return response.redirect(303, '/')
    } catch (error) {
      if (error instanceof ValidationError) {
        const ownerId = userIdFrom(request, config)
        return response.status(400).render('home', {
          links: repository.list({ ownerId, page: 1, pageSize: 100 }).items,
          error: error.message,
          userId: ownerId,
        })
      }
      return next(error)
    }
  })

  app.post('/links/:alias/toggle', (request, response, next) => {
    try {
      const ownerId = userIdFrom(request, config)
      const current = repository.get(request.params.alias)
      const link = repository.update(request.params.alias, ownerId, { active: !current?.active })
      if (request.get('hx-request') === 'true') {
        return response.render('link-row', { link, userId: ownerId })
      }
      return response.redirect(303, '/')
    } catch (error) {
      return next(error)
    }
  })

  app.post('/api/v1/links', limitCreation, (request, response, next) => {
    try {
      const ownerId = userIdFrom(request, config)
      if (!ownerId && !config.allowAnonymousCreation) {
        return sendProblem(response, 401, 'Unauthorized', 'A user identity is required')
      }
      const link = repository.create({ ...request.body, owner_id: ownerId })
      return response.status(201).json({ data: link })
    } catch (error) {
      return next(error)
    }
  })

  app.get('/api/v1/links', (request, response, next) => {
    try {
      const ownerId = userIdFrom(request, config)
      const result = repository.list({
        ownerId,
        query: typeof request.query.q === 'string' ? request.query.q.slice(0, 100) : '',
        page: parsePage(request.query.page, 1),
        pageSize: Math.min(parsePage(request.query.page_size, 20), MAX_PAGE_SIZE),
      })
      return response.json(result)
    } catch (error) {
      return next(error)
    }
  })

  app.get('/api/v1/links/:alias', (request, response, next) => {
    try {
      const link = repository.get(request.params.alias)
      if (!link) throw new NotFoundError()
      const ownerId = userIdFrom(request, config)
      if (link.owner_id && link.owner_id !== ownerId) throw new ForbiddenError()
      return response.json({ data: link })
    } catch (error) {
      return next(error)
    }
  })

  app.get('/api/v1/links/:alias/analytics', (request, response, next) => {
    try {
      return response.json({ data: repository.analytics(request.params.alias, userIdFrom(request, config)) })
    } catch (error) {
      return next(error)
    }
  })

  app.get('/api/v1/links/:alias/qr', async (request, response, next) => {
    try {
      const link = repository.get(request.params.alias)
      if (!link) throw new NotFoundError()
      if (link.owner_id !== userIdFrom(request, config)) throw new ForbiddenError()
      const image = await QRCode.toBuffer(`${config.publicBaseUrl}/${encodeURIComponent(link.alias)}`, { type: 'png' })
      return response.type('png').send(image)
    } catch (error) {
      return next(error)
    }
  })

  app.patch('/api/v1/links/:alias', (request, response, next) => {
    try {
      const link = repository.update(request.params.alias, userIdFrom(request, config), request.body)
      return response.json({ data: link })
    } catch (error) {
      return next(error)
    }
  })

  app.delete('/api/v1/links/:alias', (request, response, next) => {
    try {
      repository.remove(request.params.alias, userIdFrom(request, config))
      return response.status(204).end()
    } catch (error) {
      return next(error)
    }
  })

  app.get('/:alias', (request, response, next) => {
    try {
      const referrer = request.get('referer')
      let referrerHost = null
      if (referrer) {
        try { referrerHost = new URL(referrer).hostname.slice(0, 255) } catch { referrerHost = null }
      }
      const destination = repository.resolve(request.params.alias, referrerHost)
      return response.redirect(302, destination)
    } catch (error) {
      return next(error)
    }
  })

  app.use((request, response) => response.status(404).json(problem(404, 'Not Found', 'The requested resource was not found')))

  app.use((error, _request, response, _next) => {
    if (error instanceof ValidationError) return sendProblem(response, 400, 'Invalid request', error.message, error.errors)
    if (error instanceof NotFoundError) return sendProblem(response, 404, 'Not Found', error.message)
    if (error instanceof ForbiddenError) return sendProblem(response, 403, 'Forbidden', error.message)
    if (error.type === 'entity.too.large') return sendProblem(response, 413, 'Payload too large', 'The request body is too large')
    console.error(error)
    return sendProblem(response, 500, 'Internal Server Error', 'The server could not complete the request')
  })

  return app
}

