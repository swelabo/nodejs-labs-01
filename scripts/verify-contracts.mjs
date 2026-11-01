import { readFile } from 'node:fs/promises'

const families = ['simple-01', 'prisma-01', 'usecases-01', 'hexagonal-01', 'typescript-01', 'ddd-01']
const expectations = {
  'url-shortener': ['/api/v1/links:', '/api/v1/links/{alias}:'],
  pastebin: ['/api/v1/snippets:', '/api/v1/snippets/{id}:'],
  blog: ['/api/v1/posts:', '/api/v1/posts/{slug}:'],
}

for (const family of families) {
  for (const application of Object.keys(expectations)) {
    const path = `${family}/${application}/openapi.yaml`
    const source = await readFile(path, 'utf8')
    if (!source.includes('openapi: 3.1.0')) throw new Error(`${path}: missing OpenAPI 3.1 declaration`)
    for (const marker of expectations[application]) {
      if (!source.includes(marker)) throw new Error(`${path}: missing ${marker}`)
    }
    console.log(`contract ok: ${path}`)
  }
}
