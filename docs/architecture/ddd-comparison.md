# Domain-driven design comparison

`ddd-01` keeps the TypeScript hexagonal ports but moves business invariants
into domain code. The blog has a `Post` aggregate and immutable `Slug` value
object; URL links and snippets also validate their domain-specific values before
the repository port is called.

This is useful when a workflow has language and invariants that deserve names
and tests independent of persistence. It is not free: the model, mapping, and
domain errors add concepts that a small CRUD application may not need. Prisma
models remain persistence records, not domain entities.

The domain tests and dependency checks demonstrate that domain modules do not
import Express, Prisma, or SQLite infrastructure.

## Consistency and context boundaries

The `Post` aggregate owns publication state and slug validity because those rules
must change together. It does not own comment moderation, user authentication,
or feed delivery. Those concerns can observe a published-post event or query a
repository through an application boundary without reaching into the aggregate's
private state. A large aggregate that loads every comment and taxonomy term
would increase contention and make unrelated changes harder to reason about.

Strategically, publishing is a useful bounded-context vocabulary: a publishing
identity is mapped from the outer user/session vocabulary, and the repository
port returns the shape the application needs rather than exposing Prisma models.
The mapping is intentionally small because this curriculum is not claiming that
three applications require a complete enterprise context map.

## Events and evolution

`PostPublished` is an in-process notification. It is useful for teaching the
difference between a domain fact and a transport mechanism, but it is lost if
the process crashes before a consumer handles it. A production notification
would need an outbox, retry policy, idempotency key, and an operational owner.
The DDD variant keeps those costs visible instead of pretending that an event
listener provides durability.

## Review questions

- Which invariant would become unsafe if comments were inside the Post aggregate?
- When does a value object improve a boundary more than a string alias does?
- Which event consumer would require an outbox and why?
- What would be the cost of introducing a repository abstraction before a second
  adapter or domain test existed?
