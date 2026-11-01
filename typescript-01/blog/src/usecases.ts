import type { PostPort } from './ports.js'

export function createUseCases(postPort: PostPort) {
  return {
    listPosts: () => postPort.list(),
    createPost: (userId, role, input) => postPort.create(userId, role, input),
    readPost: (slug) => postPort.publicBySlug(slug),
    readPage: (slug) => postPort.publicPageBySlug(slug),
    updatePost: (id, userId, role, changes) => postPort.update(id, userId, role, changes),
  }
}

