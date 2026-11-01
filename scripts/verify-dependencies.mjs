import { spawnSync } from 'node:child_process'

const families = ['simple-01', 'prisma-01', 'usecases-01', 'hexagonal-01', 'typescript-01', 'ddd-01']
const applications = ['url-shortener', 'pastebin', 'blog']

for (const family of families) for (const application of applications) {
  const directory = `${family}/${application}`
  const result = spawnSync('npm', ['audit', '--omit=dev', '--audit-level=high'], { cwd: directory, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
  console.log(`dependency audit ok: ${directory}`)
}
