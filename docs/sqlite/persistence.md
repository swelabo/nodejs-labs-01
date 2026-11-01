# SQLite persistence

SQLite is an embedded relational database, not an in-memory JavaScript object.
Transactions, constraints, indexes, foreign keys, and query plans remain useful
teaching tools. The simple variants use parameterized SQL so the reader sees the
query boundary; Prisma moves query construction into a generated client while
preserving the relational model.

## Learning objectives

You should be able to model a many-to-many relationship, explain transaction
boundaries and SQLite locking, read a basic query plan, apply a migration safely,
and state when SQLite is the wrong operational choice.

## Relational modeling

Tables represent durable facts, foreign keys express ownership, and constraints
protect invariants close to the data. The Blog uses `posts`, `users`,
`categories`, `tags`, and join tables rather than a comma-separated tag string:

```sql
CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

Enable `PRAGMA foreign_keys = ON` for every connection; SQLite otherwise accepts
invalid references by default. Decide whether a child cascades, becomes null, or
blocks deletion. That is domain behavior, not an ORM preference.

## Parameterized queries

Never concatenate request values into SQL. Values belong in parameters; dynamic
identifiers require a trusted allowlist because they cannot be bound as values.

```js
const row = database.prepare(
  'SELECT id, title FROM posts WHERE slug = ? AND status = ?'
).get(slug, 'published')
```

The Pastebin search tests include an injection-shaped query and prove it is data.
Parameterization prevents injection; it does not decide whether a matched row is
public or owned by the caller.

## Transactions and invariants

A transaction groups changes that must succeed or fail together. The Blog
comment flow consumes a challenge and creates a pending comment in one
transaction, preventing a successful challenge from being replayed after a
partial write. Keep the write set small and do not make network calls inside a
write transaction.

```js
const submit = database.transaction((challengeId, comment) => {
  const consumed = database.prepare(
    'UPDATE captcha_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL'
  ).run(new Date().toISOString(), challengeId)
  if (consumed.changes !== 1) throw new Error('challenge already consumed')
  return database.prepare(
    "INSERT INTO comments (post_id, body, status) VALUES (?, ?, 'pending')"
  ).run(comment.postId, comment.body).lastInsertRowid
})
```

## Locking and WAL

SQLite permits many readers and serializes writes. A long write transaction can
block unrelated requests. WAL mode can improve reader/writer overlap, but it
does not create a distributed multi-writer database; journal files need disk
space and recovery policy. Busy timeouts, short transactions, and a
single-process deployment model are operational decisions to document.

## Indexes and query plans

An index is a write and storage cost paid to accelerate a lookup. Index columns
used in filtering, ordering, or joins, then confirm the choice with:

```sql
EXPLAIN QUERY PLAN
SELECT slug FROM posts
WHERE status = 'published' AND publish_at <= ?
ORDER BY publish_at DESC LIMIT 20;
```

The Blog has a publication-order index, but an index does not fix an unbounded
response. Paginate, cap page size, and measure representative data before
claiming a performance improvement.

## Migrations and isolation

A schema file is useful for a fresh teaching database; a migration is the
history required to evolve a database with data. Review generated SQL and test
both fresh installs and upgrades. `db:init`, `db:migrate`, and `db:seed` are
separate lifecycle operations so a reset cannot silently target production.

Prisma-backed suites run migrations against a dedicated `data/test.db`; direct
tests use isolated or in-memory databases. A green test must not depend on rows
left by a developer's previous run.

## Raw SQL and Prisma

Raw SQL exposes joins, parameters, constraints, and query plans. Prisma reduces
repetitive mapping and gives generated model methods, but it does not remove
transaction design, index selection, migration discipline, or authorization.
Compare the simple and Prisma Pastebin repositories: syntax changes while the
visibility invariant remains an application requirement.

## Security and operational limits

Use least-privilege filesystem permissions, keep database files outside public
web roots, protect backups, and treat backups as sensitive data. SQLite is not a
substitute for a managed database when many processes need concurrent writes,
high availability, online failover, or centralized access control. It is useful
for local tools, tests, and small services whose constraints are explicit.

## Python and Go comparisons

Python's `sqlite3` and Go's `database/sql` expose the same concerns: parameters,
transactions, connections, and migrations. Node adds an event-loop constraint:
a synchronous SQLite call blocks JavaScript execution, while an async driver
adds its own concurrency and lifecycle behavior. Neither language makes an
unsafe schema or authorization query safe by default.

## Exercises

1. Add a foreign key and prove invalid references fail.
2. Compare `EXPLAIN QUERY PLAN` before and after adding an index.
3. Move a two-write operation into a transaction and test rollback.
4. Explain why WAL improves some workloads but does not remove the single-writer
   constraint.

References: [SQLite transactions](https://sqlite.org/lang_transaction.html),
[locking](https://sqlite.org/lockingv3.html), [WAL](https://sqlite.org/wal.html),
[query planning](https://sqlite.org/queryplanner.html), and
[foreign keys](https://sqlite.org/foreignkeys.html).
