export class InvalidLinkError extends Error {
  constructor(message: string) { super(message); this.name = 'InvalidLinkError' }
}

export class Alias {
  readonly value: string
  private constructor(value: string) { this.value = value; Object.freeze(this) }
  static from(value: unknown): Alias {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{3,64}$/.test(value)) throw new InvalidLinkError('alias is invalid')
    return new Alias(value)
  }
}

export class Link {
  private constructor(private readonly alias: Alias | undefined, private readonly destination: string) {}
  static create(input: Record<string, unknown>): Link {
    if (typeof input.destination_url !== 'string') throw new InvalidLinkError('destination_url is required')
    let url: URL
    try { url = new URL(input.destination_url) } catch { throw new InvalidLinkError('destination_url is invalid') }
    if (!['http:', 'https:'].includes(url.protocol)) throw new InvalidLinkError('destination_url must use HTTP or HTTPS')
    return new Link(input.alias === undefined ? undefined : Alias.from(input.alias), url.toString())
  }
  toPersistence() { return { ...(this.alias ? { alias: this.alias.value } : {}), destination_url: this.destination } }
}
