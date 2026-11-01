export function createUseCases(repository) {
  return {
    listPosts: () => repository.list(),
    createPost: (userId, role, input) => repository.create(userId, role, input),
    readPost: (slug) => repository.publicBySlug(slug),
    readPage: (slug) => repository.publicPageBySlug(slug),
    updatePost: (id, userId, role, changes) => repository.update(id, userId, role, changes),
  }
}

