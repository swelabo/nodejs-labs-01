import process from 'node:process'

export function loadConfig(env = process.env) {
  return {
    port: Number.parseInt(env.PORT || '3002', 10),
    databasePath: env.DATABASE_PATH || './data/pastebin.db',
    allowAnonymousSubmissions: env.ALLOW_ANONYMOUS_SUBMISSIONS !== 'false',
  }
}

