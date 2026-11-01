export interface SnippetPort {
  create(input: Record<string, unknown>): Promise<Record<string, unknown>>
  list(filters: any): Promise<unknown>
  read(id: string, ownerId: string | null): Promise<Record<string, unknown>>
  update(id: string, ownerId: string | null, changes: Record<string, unknown>): Promise<Record<string, unknown>>
  remove(id: string, ownerId: string | null): Promise<void>
}

const methods: Array<keyof SnippetPort> = ['create', 'list', 'read', 'update', 'remove']

export function requireSnippetPort(candidate: Partial<SnippetPort> | undefined): SnippetPort {
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') {
      throw new TypeError(`Snippet port requires ${String(method)}()`)
    }
  }
  return candidate as SnippetPort
}
