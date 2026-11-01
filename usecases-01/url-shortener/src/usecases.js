// The use-case layer owns application workflows. HTTP adapters supply input and
// translate the result; they do not decide how a link is created or resolved.
export function createUseCases(repository) {
  return {
    createLink: (input) => repository.create(input),
    listLinks: (ownerId) => repository.list(ownerId),
    updateLink: (alias, ownerId, changes) => repository.update(alias, ownerId, changes),
    deleteLink: (alias, ownerId) => repository.remove(alias, ownerId),
    resolveLink: (alias, referrerHost) => repository.resolve(alias, referrerHost),
  }
}

