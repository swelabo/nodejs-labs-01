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

## Exercises

1. Add an index for the most common public-snippet query and inspect the
   migration.
2. Write a test proving that a private record remains undiscoverable through
   the Prisma list operation.
3. Compare relation loading and query round trips without claiming an
   improvement that has not been measured.
