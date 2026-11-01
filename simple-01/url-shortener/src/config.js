import process from 'node:process'

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function loadConfig(env = process.env) {
  return {
    port: positiveInteger(env.PORT, 3001),
    databasePath: env.DATABASE_PATH || './data/url-shortener.db',
    allowAnonymousCreation: env.ALLOW_ANONYMOUS_CREATION === 'true',
    developmentUserId: env.DEV_USER_ID || 'dev-user',
    publicBaseUrl: env.PUBLIC_BASE_URL || `http://localhost:${positiveInteger(env.PORT, 3001)}`,
    rateLimitPerMinute: positiveInteger(env.RATE_LIMIT_PER_MINUTE, 60),
  }
}

