export interface DomainEvent {
  readonly type: string
  readonly occurredAt: Date
  readonly payload: Readonly<Record<string, unknown>>
}

export class PostPublished implements DomainEvent {
  readonly type = 'PostPublished'
  readonly occurredAt = new Date()
  constructor(readonly payload: Readonly<Record<string, unknown>>) {}
}
