import { InvalidPublicationStateError } from './errors.js'
import { Slug } from './slug.js'
import { DomainEvent, PostPublished } from './events.js'

export type PublicationStatus = 'draft' | 'scheduled' | 'published'

export interface PostAttributes {
  slug: Slug
  title: string
  body: string
  status: PublicationStatus
  publish_at: string | null
}

export class Post {
  private readonly pendingEvents: DomainEvent[] = []
  private constructor(private readonly attributes: PostAttributes) {
    if (attributes.status === 'published') this.pendingEvents.push(new PostPublished({ slug: attributes.slug.value }))
  }

  static draft(input: Record<string, unknown>): Post {
    const title = typeof input.title === 'string' ? input.title.trim() : ''
    const body = typeof input.body === 'string' ? input.body : ''
    if (!title || !body) throw new InvalidPublicationStateError('title and body are required')
    const status = (input.status ?? 'draft') as PublicationStatus
    if (!['draft', 'scheduled', 'published'].includes(status)) {
      throw new InvalidPublicationStateError('publication status is invalid')
    }
    const publishAt = input.publish_at == null ? null : String(input.publish_at)
    if (status === 'scheduled' && !publishAt) {
      throw new InvalidPublicationStateError('scheduled posts require publish_at')
    }
    return new Post({ slug: Slug.from(input.slug), title, body, status, publish_at: publishAt })
  }

  revise(changes: Record<string, unknown>): Post {
    return Post.draft({
      slug: this.attributes.slug.value,
      title: changes.title ?? this.attributes.title,
      body: changes.body ?? this.attributes.body,
      status: changes.status ?? this.attributes.status,
      publish_at: changes.publish_at === undefined ? this.attributes.publish_at : changes.publish_at,
    })
  }

  toPersistence(): Record<string, unknown> {
    return { ...this.attributes, slug: this.attributes.slug.value }
  }

  pullEvents(): DomainEvent[] {
    return this.pendingEvents.splice(0, this.pendingEvents.length)
  }
}
