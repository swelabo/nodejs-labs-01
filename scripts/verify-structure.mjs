import { readFile, access } from 'node:fs/promises'

const families = ['simple-01', 'prisma-01', 'usecases-01', 'hexagonal-01', 'typescript-01', 'ddd-01']
const applications = ['url-shortener', 'pastebin', 'blog']
const required = ['help', 'install', 'start', 'dev', 'test', 'lint', 'clean', 'db-migrate', 'db-seed', 'db-reset', 'frontend-build']

for (const family of families) for (const application of applications) {
  const directory = `${family}/${application}`
  const makefile = await readFile(`${directory}/Makefile`, 'utf8')
  const packageManifest = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'))
  for (const target of required) if (!new RegExp(`^${target}:`, 'm').test(makefile) && !makefile.includes(` ${target} `)) throw new Error(`${directory}: missing Make target ${target}`)
  if (!packageManifest.scripts?.start || !packageManifest.scripts?.test || !packageManifest.scripts?.['db:seed'] || !packageManifest.scripts?.['frontend:build']) throw new Error(`${directory}: missing lifecycle npm script`)
  await access(`${directory}/src/public/input.css`)
  await access(`${directory}/src/views`)
  console.log(`structure ok: ${directory}`)
}
