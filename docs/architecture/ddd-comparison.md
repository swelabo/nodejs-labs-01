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
