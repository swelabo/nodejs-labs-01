import type { Post } from './post.js'

// Domain code names the persistence capability without importing Prisma. The
// application PostPort is the HTTP-facing variant of this boundary; this
// interface documents the aggregate-oriented repository vocabulary.
export interface PostRepository {
  save(post: Post): Promise<void>
  bySlug(slug: string): Promise<Post | null>
}
