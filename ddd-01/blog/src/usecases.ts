import type { PostPort } from './ports.js'
import { PostFactory } from './domain/factory.js'

export function createUseCases(postPort: PostPort) {
  return {
    listPosts: () => postPort.list(),
    createPost: (userId, role, input) => postPort.create(userId, role, PostFactory.create(input).toPersistence()),
    readPost: (slug) => postPort.publicBySlug(slug),
    readPage: (slug) => postPort.publicPageBySlug(slug),
    updatePost: (id, userId, role, changes) => postPort.update(id, userId, role, changes),
  }
}

