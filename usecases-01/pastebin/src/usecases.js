export function createUseCases(repository) {
  return {
    createSnippet: (input) => repository.create(input),
    listSnippets: (filters) => repository.list(filters),
    readSnippet: (id, ownerId) => repository.read(id, ownerId),
    updateSnippet: (id, ownerId, changes) => repository.update(id, ownerId, changes),
    deleteSnippet: (id, ownerId) => repository.remove(id, ownerId),
  }
}

