const methods = ['create', 'list', 'read', 'update', 'remove']

export function requireSnippetPort(candidate) {
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') {
      throw new TypeError(`Snippet port requires ${method}()`)
    }
  }
  return candidate
}
