import { readFile } from 'node:fs/promises'

const families = ['simple-01', 'prisma-01', 'usecases-01', 'hexagonal-01', 'typescript-01', 'ddd-01']
const expectations = {
  'url-shortener': ['/api/v1/links:', '/api/v1/links/{alias}:'],
  pastebin: ['/api/v1/snippets:', '/api/v1/snippets/{id}:'],
  blog: ['/api/v1/posts:', '/api/v1/posts/{slug}:', '/api/v1/pages/{slug}:'],
}

for (const family of families) {
  for (const application of Object.keys(expectations)) {
    const path = `${family}/${application}/openapi.yaml`
    const source = await readFile(path, 'utf8')
    if (!source.includes('openapi: 3.1.0')) throw new Error(`${path}: missing OpenAPI 3.1 declaration`)
    if (!/^info:/m.test(source) || !/\btitle:/m.test(source) || !/\bversion:/m.test(source)) throw new Error(`${path}: incomplete API metadata`)
    if (!/^paths:\n/m.test(source) || !/^components:\n/m.test(source)) throw new Error(`${path}: missing paths or components sections`)
    for (const marker of expectations[application]) {
      if (!source.includes(marker)) throw new Error(`${path}: missing ${marker}`)
    }
    const documented = new Map()
    let currentPath = null
    let currentOperation = null
    for (const line of source.split('\n')) {
      const pathMatch = line.match(/^  (\/[^:]+):/)
      if (pathMatch) {
        currentPath = pathMatch[1]
        currentOperation = null
        continue
      }
      if (line === 'components:') {
        currentPath = null
        currentOperation = null
        continue
      }
      const operationMatch = line.match(/^    (get|post|put|patch|delete):/)
      if (operationMatch && currentPath) {
        currentOperation = { path: currentPath, method: operationMatch[1], text: line }
        documented.set(`${operationMatch[1]} ${currentPath}`, currentOperation)
        continue
      }
      if (currentOperation) currentOperation.text += `\n${line}`
    }
    for (const operation of documented.values()) {
      if (!/\bsummary:/.test(operation.text)) throw new Error(`${path}: ${operation.method.toUpperCase()} ${operation.path} is missing summary`)
      if (!/\bresponses:/.test(operation.text)) throw new Error(`${path}: ${operation.method.toUpperCase()} ${operation.path} is missing responses`)
    }
    const sourceFile = `${family}/${application}/src/app.${family === 'typescript-01' || family === 'ddd-01' ? 'ts' : 'js'}`
    const implementation = await readFile(sourceFile, 'utf8')
    const implemented = [...implementation.matchAll(/app\.(get|post|put|patch|delete)\(\s*["']([^"']+)/g)]
      .map((match) => ({ method: match[1], path: match[2].replace(/:([A-Za-z0-9_]+)/g, '{$1}') }))
      .filter((operation) => operation.path.startsWith('/api/') || ['/feed.xml', '/sitemap.xml', '/{alias}'].includes(operation.path))
    for (const operation of implemented) {
      if (!documented.has(`${operation.method} ${operation.path}`)) throw new Error(`${path}: implementation route ${operation.method.toUpperCase()} ${operation.path} is undocumented`)
    }
    console.log(`contract ok: ${path}`)
  }
}
