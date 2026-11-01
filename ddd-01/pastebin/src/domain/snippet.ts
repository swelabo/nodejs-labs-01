export type Visibility = 'public' | 'private'
export class InvalidSnippetError extends Error { constructor(message: string) { super(message); this.name = 'InvalidSnippetError' } }
export class Snippet {
  private constructor(private readonly content: string, private readonly visibility: Visibility) {}
  static create(input: Record<string, unknown>): Snippet {
    if (typeof input.content !== 'string' || input.content.length === 0) throw new InvalidSnippetError('content is required')
    const visibility = (input.visibility ?? 'public') as Visibility
    if (!['public', 'private'].includes(visibility)) throw new InvalidSnippetError('visibility is invalid')
    return new Snippet(input.content, visibility)
  }
  toPersistence() { return { content: this.content, visibility: this.visibility } }
}
