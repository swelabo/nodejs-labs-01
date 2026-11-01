# Six-variant comparison

| Variant | Primary change | Boundary that matters | Cost introduced |
| --- | --- | --- | --- |
| `simple-01` | Direct Express + SQL | Route/application code | Fast to understand; responsibilities can converge |
| `prisma-01` | ORM persistence | Prisma client and schema | Less SQL repetition; query and migration behavior becomes indirect |
| `usecases-01` | Explicit workflows | Use-case functions | HTTP tests become thinner; another layer must be named and maintained |
| `hexagonal-01` | Dependency inversion | Ports and adapters | Repositories can be replaced; composition and contracts add ceremony |
| `typescript-01` | Static contracts | TypeScript interfaces | Errors move earlier; runtime input still needs validation |
| `ddd-01` | Domain behavior | Aggregates and value objects | Invariants gain names; mapping and model design require judgment |

The sequence is comparative, not a maturity ladder. The DDD URL shortener can
be a worse choice than the simple implementation if its rules remain trivial;
the blog has richer publication language and benefits more from an explicit
domain model. The all-variant runner provides evidence that behavior survived
the architectural changes, while the individual tests show what each boundary
actually isolates.

Use `npm run verify:apps` to execute the matrix. Read the source and the
architecture tests as well: a green endpoint test alone cannot prove dependency
inversion or domain isolation.
