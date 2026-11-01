// Ports are small capability contracts. The application depends on this shape,
// while Prisma, memory, or another database implementation supplies the adapter.
export interface LinkInput { destination: string; alias?: string; expires_at?: string | null; owner_id?: string }
export type LinkRecord = Record<string, unknown>
export interface LinkPort {
  // The interface is a compile-time contract; requireLinkPort below remains
  // necessary because HTTP input and JavaScript adapters exist at runtime.
  create(input: LinkInput): Promise<LinkRecord>
  list(ownerId: string): Promise<unknown>
  update(alias: string, ownerId: string, changes: Partial<LinkInput>): Promise<LinkRecord>
  remove(alias: string, ownerId: string): Promise<void>
  resolve(alias: string, referrerHost: string | null): Promise<string>
}

const methods: Array<keyof LinkPort> = ['create', 'list', 'update', 'remove', 'resolve']

export function requireLinkPort(candidate: Partial<LinkPort> | undefined): LinkPort {
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') {
      throw new TypeError(`Link port requires ${String(method)}()`)
    }
  }
  return candidate as LinkPort
}

