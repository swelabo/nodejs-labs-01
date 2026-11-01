// The use-case layer owns application workflows. HTTP adapters supply input and
// translate the result; they do not decide how a link is created or resolved.
export function createUseCases(linkPort) {
  return {
    createLink: (input) => linkPort.create(input),
    listLinks: (ownerId) => linkPort.list(ownerId),
    updateLink: (alias, ownerId, changes) => linkPort.update(alias, ownerId, changes),
    deleteLink: (alias, ownerId) => linkPort.remove(alias, ownerId),
    resolveLink: (alias, referrerHost) => linkPort.resolve(alias, referrerHost),
  }
}

