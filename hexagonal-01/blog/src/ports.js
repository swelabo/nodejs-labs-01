const methods = ['list', 'create', 'publicBySlug', 'update']

export function requirePostPort(candidate) {
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') {
      throw new TypeError(`Post port requires ${method}()`)
    }
  }
  return candidate
}
