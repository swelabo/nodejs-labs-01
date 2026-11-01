// Ports are small capability contracts. The application depends on this shape,
// while Prisma, memory, or another database implementation supplies the adapter.
const methods = ['create', 'list', 'update', 'remove', 'resolve']

export function requireLinkPort(candidate) {
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') throw new TypeError(`Link port requires ${method}()`)
  }
  return candidate
}

