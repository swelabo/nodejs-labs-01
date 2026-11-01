import { Link } from './domain/link.js'
// The use-case layer owns application workflows. HTTP adapters supply input and
// translate the result; they do not decide how a link is created or resolved.
export function createUseCases(linkPort: LinkPort) {
  return {
    createLink: (input: LinkInput) => linkPort.create({ ...input, ...Link.create(input as unknown as Record<string, unknown>).toPersistence() }),
    listLinks: (ownerId: string) => linkPort.list(ownerId),
    updateLink: (alias: string, ownerId: string, changes: Partial<LinkInput>) => linkPort.update(alias, ownerId, changes),
    deleteLink: (alias: string, ownerId: string) => linkPort.remove(alias, ownerId),
    resolveLink: (alias: string, referrerHost: string | null) => linkPort.resolve(alias, referrerHost),
  }
}

import type { LinkInput, LinkPort } from './ports.js'

