export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class InvalidSlugError extends DomainError {}
export class InvalidPublicationStateError extends DomainError {}
