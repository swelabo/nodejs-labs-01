export interface PostPort {
  list(): Promise<unknown>
  create(userId: string | null, role: string, input: Record<string, unknown>): Promise<Record<string, unknown>>
  publicBySlug(slug: string): Promise<Record<string, unknown>>
  publicPageBySlug(slug: string): Promise<Record<string, unknown>>
  update(id: number, userId: string | null, role: string, changes: Record<string, unknown>): Promise<Record<string, unknown>>
}

const methods: Array<keyof PostPort> = ['list', 'create', 'publicBySlug', 'publicPageBySlug', 'update']

export function requirePostPort(candidate: Partial<PostPort> | undefined): PostPort {
  for (const method of methods) {
    if (!candidate || typeof candidate[method] !== 'function') {
      throw new TypeError(`Post port requires ${String(method)}()`)
    }
  }
  return candidate as PostPort
}
