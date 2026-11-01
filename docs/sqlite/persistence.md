# SQLite persistence

SQLite is an embedded relational database, not an in-memory JavaScript object.
Transactions, constraints, indexes, and foreign keys therefore remain useful
teaching tools. The simple variants use parameterized SQL so the reader can see
the query boundary; the Prisma variants move query construction into a typed
client while keeping the same schema and observable behavior.

The distinction matters architecturally. An ORM can reduce repetitive mapping
and make common queries readable, but it does not remove transaction design,
index selection, migration discipline, or authorization decisions. The
`prisma-01` README and comparison chapter pair the generated client with the
raw-SQL implementation rather than presenting Prisma as a universal upgrade.

For tests, migrations are applied before the suite and data is isolated between
tests. Production systems additionally need backup, restore, WAL/concurrency,
and schema rollback procedures; a local educational database does not provide
those operational guarantees automatically.
