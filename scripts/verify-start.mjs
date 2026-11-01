import { spawn } from 'node:child_process'

const applications = [
  'simple-01/url-shortener', 'simple-01/pastebin', 'simple-01/blog',
  'prisma-01/url-shortener', 'prisma-01/pastebin', 'prisma-01/blog',
  'usecases-01/url-shortener', 'usecases-01/pastebin', 'usecases-01/blog',
  'hexagonal-01/url-shortener', 'hexagonal-01/pastebin', 'hexagonal-01/blog',
  'typescript-01/url-shortener', 'typescript-01/pastebin', 'typescript-01/blog',
  'ddd-01/url-shortener', 'ddd-01/pastebin', 'ddd-01/blog',
]

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

for (const directory of applications) {
  const child = spawn('npm', ['start'], {
    cwd: directory,
    env: { ...process.env, PORT: '0' },
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let stderr = ''
  child.stderr.on('data', (chunk) => { stderr += chunk })
  await wait(1200)
  if (child.exitCode !== null) throw new Error(`${directory} exited with ${child.exitCode}: ${stderr}`)
  process.kill(-child.pid, 'SIGTERM')
  await wait(200)
  console.log(`start ok: ${directory}`)
}
