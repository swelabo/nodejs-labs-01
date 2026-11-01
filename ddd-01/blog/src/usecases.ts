import type { PostPort } from './ports.js'
import { Post } from './domain/post.js'

export function createUseCases(postPort: PostPort) {
  return {
    listPosts: () => postPort.list(),
    createPost: (userId, role, input) => postPort.create(userId, role, Post.draft(input).toPersistence()),
    readPost: (slug) => postPort.publicBySlug(slug),
    updatePost: (id, userId, role, changes) => postPort.update(id, userId, role, changes),
  }
}

