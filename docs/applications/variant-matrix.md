# Application variant matrix

Every application directory is independently runnable. The root matrix invokes
the local package scripts; run an individual variant from its directory when
studying one architecture.

| Family | URL shortener | Pastebin | Blog |
| --- | --- | --- | --- |
| JavaScript + SQL | `simple-01/url-shortener` | `simple-01/pastebin` | `simple-01/blog` |
| JavaScript + Prisma | `prisma-01/url-shortener` | `prisma-01/pastebin` | `prisma-01/blog` |
| Use cases | `usecases-01/url-shortener` | `usecases-01/pastebin` | `usecases-01/blog` |
| Hexagonal | `hexagonal-01/url-shortener` | `hexagonal-01/pastebin` | `hexagonal-01/blog` |
| TypeScript | `typescript-01/url-shortener` | `typescript-01/pastebin` | `typescript-01/blog` |
| DDD | `ddd-01/url-shortener` | `ddd-01/pastebin` | `ddd-01/blog` |

The canonical specifications under `specifications/` define the stable domain
language. Variant READMEs explain intentional deviations and each suite proves
the behavior it currently implements. A copied directory is not considered
complete merely because it starts: it must install, migrate, test, and document
its architectural distinction.

## Feature parity boundary

The direct JavaScript Blog is the domain-rich reference implementation. Later
variants carry the publication invariant and the static-page read through their
own persistence/application boundaries, while intentionally retaining a smaller
post-focused slice for the architectural experiment. This is an explicit
teaching deviation, not an accidental claim of full parity.

| Blog capability | `simple-01` | Later five variants |
| --- | --- | --- |
| Published posts and scheduled visibility | tested | tested |
| Static-page permalink and visibility | tested in HTML and API | tested through API and port/use-case boundaries |
| Author pages and yearly/monthly archives | tested | not carried forward yet |
| Categories, tags, custom taxonomies | hierarchical category/tag reads and writes tested | not carried forward yet |
| Comments, moderation, challenge, feed, sitemap | tested | not carried forward yet |
| Authentication and administration | session, CSRF, role/user tests | development identity only |
| Media uploads | intentionally out of scope | intentionally out of scope |

The matrix is part of the acceptance evidence: a route or OpenAPI file is not
described as proof of a feature when the corresponding implementation and test
are absent.
