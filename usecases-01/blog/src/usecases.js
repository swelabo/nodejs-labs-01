export function createUseCases(repository) {
  return {
    listPosts: () => repository.list(),
    createPost: (userId, role, input) => repository.create(userId, role, input),
    readPost: (slug) => repository.publicBySlug(slug),
    updatePost: (id, userId, role, changes) => repository.update(id, userId, role, changes),
  }
}

