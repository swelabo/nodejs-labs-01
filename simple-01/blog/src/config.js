import process from 'node:process'

export function loadConfig(env = process.env) {
  return {
    port: Number.parseInt(env.PORT || '3003', 10),
    databasePath: env.DATABASE_PATH || './data/blog.db',
    editorUserIds: new Set((env.EDITOR_USER_IDS || 'dev-editor').split(',').map((value) => value.trim()).filter(Boolean)),
    administratorUserIds: new Set((env.ADMIN_USER_IDS || 'dev-admin').split(',').map((value) => value.trim()).filter(Boolean)),
  }
}

