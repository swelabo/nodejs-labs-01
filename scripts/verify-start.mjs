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

for (const [index, directory] of applications.entries()) {
  const port = 39000 + index
  const child = spawn('npm', ['start'], {
    cwd: directory,
    env: { ...process.env, PORT: String(port) },
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let stderr = ''
  child.stderr.on('data', (chunk) => { stderr += chunk })
  await wait(1200)
  if (child.exitCode !== null) throw new Error(`${directory} exited with ${child.exitCode}: ${stderr}`)
  const page = await fetch(`http://127.0.0.1:${port}/`)
  if (!page.ok) throw new Error(`${directory} returned ${page.status} for /`)
  const html = await page.text()
  if (!html.includes('/styles.css') || !html.includes('/vendor/htmx.min.js') || !html.includes('/vendor/alpine.min.js')) {
    throw new Error(`${directory} did not render the local frontend assets`)
  }
  const stylesheet = await fetch(`http://127.0.0.1:${port}/styles.css`)
  if (!stylesheet.ok) throw new Error(`${directory} did not serve styles.css`)
  process.kill(-child.pid, 'SIGTERM')
  await wait(200)
  console.log(`start ok: ${directory}`)
}
