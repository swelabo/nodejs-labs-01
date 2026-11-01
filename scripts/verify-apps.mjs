import { spawnSync } from 'node:child_process'

const applications = [
  ['simple-01/url-shortener', ['test']], ['simple-01/pastebin', ['test']], ['simple-01/blog', ['test']],
  ['prisma-01/url-shortener', ['test']], ['prisma-01/pastebin', ['test']], ['prisma-01/blog', ['test']],
  ['usecases-01/url-shortener', ['test']], ['usecases-01/pastebin', ['test']], ['usecases-01/blog', ['test']],
  ['hexagonal-01/url-shortener', ['test']], ['hexagonal-01/pastebin', ['test']], ['hexagonal-01/blog', ['test']],
  ['typescript-01/url-shortener', ['run', 'typecheck']], ['typescript-01/url-shortener', ['test']],
  ['typescript-01/pastebin', ['run', 'typecheck']], ['typescript-01/pastebin', ['test']],
  ['typescript-01/blog', ['run', 'typecheck']], ['typescript-01/blog', ['test']],
  ['ddd-01/url-shortener', ['run', 'typecheck']], ['ddd-01/url-shortener', ['test']],
  ['ddd-01/pastebin', ['run', 'typecheck']], ['ddd-01/pastebin', ['test']],
  ['ddd-01/blog', ['run', 'typecheck']], ['ddd-01/blog', ['test']],
]

for (const [directory, args] of applications) {
  console.log(`\n==> ${directory}: npm ${args.join(' ')}`)
  const result = spawnSync('npm', args, { cwd: directory, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
