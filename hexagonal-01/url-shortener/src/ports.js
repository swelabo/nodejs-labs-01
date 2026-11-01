// Ports are small capability contracts. The application depends on this shape,
// while Prisma, memory, or another database implementation supplies the adapter.
const methods = ['create', 'list', 'update', 'remove', 'resolve']

export function requireLinkPort(candidate) {
  // JavaScript has no runtime interface declaration. This small composition
  // check fails at startup, close to the wiring error, instead of allowing a
  // missing method to fail during a rarely used request path.
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') throw new TypeError(`Link port requires ${method}()`)
  }
  return candidate
}

