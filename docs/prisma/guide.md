# Prisma without losing the database model

Prisma is an ORM and generated client, not a replacement for relational
design. The schema in `prisma-01` declares models and relations; migrations
turn that declaration into SQLite schema changes; the generated client exposes
JavaScript methods for reads and writes. The application remains JavaScript in
this phase even though Prisma 7 uses a TypeScript configuration file.

```text
schema.prisma → migration → SQLite
       ↓
generated client → repository adapter → use case → HTTP
```

The repository still decides which records a caller may see, how a transaction
groups writes, and which errors become a public response. An ORM query that
returns a row is not authorization. Compare the Prisma and simple Pastebin
repositories and identify the SQL that disappeared and the invariants that did
not.

## Migration discipline

Generate a migration from a deliberate schema change, review the SQL, apply it
to an isolated database, and run the behavior tests. `prisma generate` creates a
client; it does not apply migrations. `prisma migrate deploy` applies committed
migrations; it does not invent a safe production rollback.

## Query shape and observability

Prisma's fluent calls still describe SQL operations. A relation selection may
issue additional work depending on the query strategy, so inspect query logs or
a database trace before claiming that an ORM query is one round trip. Select
only fields needed by the boundary and keep public predicates in the repository
rather than returning every column and filtering in JavaScript.

```js
const posts = await database.post.findMany({
  where: { status: 'published', publishAt: { lte: new Date() } },
  select: { slug: true, title: true, author: { select: { displayName: true } } },
  orderBy: { publishAt: 'desc' },
  take: 20,
})
```

The generated client catches misspelled model fields during development, but it
does not know whether a caller may see a row. A query can be type-correct and
still be an authorization bug. The direct and Prisma Blog implementations both
apply publication state and publication time before mapping public output.

## Transactions and error mapping

Use a transaction when multiple writes represent one invariant. Keep its callback
free of network calls and do not pass a transaction client outside its lifetime.
Database uniqueness errors are infrastructure details; repositories should map
them to a stable validation error rather than leaking a provider code through
HTTP.

```js
await database.$transaction(async (transaction) => {
  await transaction.post.update({ where: { id }, data: { status: 'published' } })
  await transaction.auditEvent.create({ data: { action: 'publish', postId: id } })
})
```

An in-process callback is not a durable message broker. Durable domain events,
retries, and delivery guarantees need an outbox or another explicit design.

## Debugging and performance

Enable Prisma query logging in a local experiment, compare generated SQL with
the raw-SQL variant, and inspect SQLite's query plan. Watch for N+1 relation
loads, unbounded `findMany`, accidental full-table scans, and implicit date or
timezone conversions. Benchmark only after defining data volume, indexes,
concurrency, and the metric being measured. An ORM may improve developer speed
without improving latency, while raw SQL may be faster for one query and cost
more maintenance.

## Python and Go comparisons

Prisma is closer to a generated data-access layer than to a universal active
record model. Python developers may compare it with SQLAlchemy query objects;
Go developers may compare it with generated SQL or a repository over
`database/sql`. In all three ecosystems, generated syntax does not replace
schema design, transactions, authorization, or operational review.

## Exercises

1. Add an index for the most common public-snippet query and inspect the
   migration.
2. Write a test proving that a private record remains undiscoverable through
   the Prisma list operation.
3. Compare relation loading and query round trips without claiming an
   improvement that has not been measured.
4. Add a uniqueness conflict and map it to a stable problem response.
5. Enable query logging for one public list request and compare it with raw SQL.
