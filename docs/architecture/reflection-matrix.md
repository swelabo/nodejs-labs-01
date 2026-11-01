# Application reflection matrix

The matrix records the engineering reflection required after each application.
The detailed comparison pages explain the recurring tradeoffs; this page keeps
the evidence discoverable for all eighteen implementations.

| Variant | URL shortener | Pastebin | Blog |
| --- | --- | --- | --- |
| Simple | Direct SQL is readable and fast to change; integration tests carry most of the seam. | Escaping, visibility, and raw text make trust boundaries visible. | Rich workflows expose why direct handlers eventually need separation. |
| Prisma | Mapping is shorter, but generated client and migrations must be understood. | Relation loading simplifies tags; authorization remains application code. | ORM persistence does not replace publication and role rules. |
| Use cases | Workflow tests can avoid HTTP; the extra layer is worthwhile for management operations. | Snippet operations become reusable outside Express. | Publication operations are clearer, but the repository still contains policy. |
| Hexagonal | A link port enables a memory adapter and makes dependency direction explicit. | A snippet port isolates storage while preserving visibility tests. | A post port isolates publication workflows; composition wiring is extra work. |
| TypeScript | Static link contracts catch adapter shape mistakes before execution. | Typed snippet capabilities reduce drift between use cases and adapters. | Typed post capabilities clarify the publication vocabulary. |
| DDD | Alias and destination invariants have named domain behavior; elaborate contexts are not justified. | Visibility/content rules are explicit but remain a small model. | Publication aggregate, slug value object, event, and transaction boundary justify the added model. |

For each row, testing combines database behavior with boundary tests. Performance
claims remain hypotheses unless a benchmark or query inspection supports them;
the repository intentionally records no invented throughput numbers. Security
assumptions are local-development assumptions unless the security chapter says
otherwise.
