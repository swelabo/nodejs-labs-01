export function createUseCases(snippetPort) {
  return {
    createSnippet: (input) => snippetPort.create(input),
    listSnippets: (filters) => snippetPort.list(filters),
    readSnippet: (id, ownerId) => snippetPort.read(id, ownerId),
    updateSnippet: (id, ownerId, changes) => snippetPort.update(id, ownerId, changes),
    deleteSnippet: (id, ownerId) => snippetPort.remove(id, ownerId),
  }
}

