import { access } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
let dbModule
try { await access(`${root}/src/db.ts`); dbModule = await import(pathToFileURL(`${root}/src/db.ts`)) } catch { dbModule = await import(pathToFileURL(`${root}/src/db.js`)) }
const database = dbModule.createDatabase()
const application = root.split('/').at(-1)

if (application === 'url-shortener') {
  await database.link.upsert({ where: { alias: 'node' }, update: { destinationUrl: 'https://nodejs.org' }, create: { alias: 'node', destinationUrl: 'https://nodejs.org', ownerId: 'seed-user' } })
} else if (application === 'pastebin') {
  await database.snippet.upsert({ where: { id: 'seed-snippet' }, update: { content: 'Seed snippet' }, create: { id: 'seed-snippet', content: 'Seed snippet', ownerId: 'seed-user', visibility: 'public', language: 'text', tags: { create: [{ tag: 'seed' }] } } })
} else if (application === 'blog') {
  await database.user.upsert({ where: { id: 'seed-editor' }, update: { role: 'editor' }, create: { id: 'seed-editor', role: 'editor', displayName: 'Seed Editor' } })
  await database.post.upsert({ where: { slug: 'seed-post' }, update: { title: 'Seed post' }, create: { slug: 'seed-post', title: 'Seed post', body: 'Seed content', authorId: 'seed-editor', status: 'published' } })
} else throw new Error(`unsupported application directory: ${application}`)

await database.$disconnect()
console.log(`Seed data loaded for ${application}`)
