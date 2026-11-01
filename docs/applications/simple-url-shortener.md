# The direct-handler URL shortener

The `simple-01/url-shortener` application is the first executable architecture
experiment. It creates and resolves short links with Express and SQLite. The
implementation keeps routing, validation, persistence, and response formatting
close together so the cost of that arrangement is concrete before a later
variant introduces explicit use cases.

## Follow one request

When a client sends `POST /api/v1/links`, Express parses the JSON body and calls
the route handler in `src/app.js`. The handler obtains the development identity
from `X-User-Id`, then calls the repository with a plain JavaScript object. The
repository validates the destination with the platform `URL` class, validates
the optional alias, and executes a parameterized SQLite `INSERT`.

The handler returns `{ data: ... }` with status `201`. There is no service
container and no domain object in this variant. That is a limitation by design:
the reader can see exactly where an HTTP concern ends and a database concern
begins, even though the boundary is not yet strong.

## Redirect behavior

`GET /:alias` loads the stored destination, checks the active flag and expiration,
records a coarse referrer host, and returns `302` with `Location`. The request
never supplies the redirect target. This prevents the route from becoming an
open redirect endpoint whose destination is controlled by each request.

Analytics are best effort in this baseline. A failed click insert does not turn a
valid redirect into an error response. That policy is visible in the repository
and should be revisited when the application needs durable event delivery.

The dashboard is an EJS page with HTMX-compatible form actions, Alpine.js
initialization, and Tailwind utility classes. The browser dependencies are
loaded from CDNs in this teaching slice; a production deployment would pin and
serve reviewed assets locally. Owned links can also produce a PNG QR code. The
creation endpoint has an in-memory per-process rate limit, which protects a
single process but is not a distributed abuse-control system.

## Why raw SQL comes first

The repository uses parameter binding rather than string interpolation. The
student can inspect the schema, indexes, uniqueness constraint, foreign key, and
query shape directly. Later, `prisma-01` will replace this persistence mechanism
while preserving the application behavior. The comparison can then distinguish
ORM ergonomics from architectural improvement.

## Testing evidence

Run the suite from the application directory:

```sh
make test
```

The tests use an in-memory SQLite database for isolation. They cover successful
creation and redirect resolution, unsafe schemes, duplicate aliases, expiration,
ownership, list boundaries, and the essential OpenAPI paths. They do not claim
that the development identity is production authentication or that the current
rate-limit seam is sufficient for public anonymous creation.

## Next pressure for change

The direct design becomes uncomfortable when several transports need the same
workflow, when authentication is real, or when tests must exercise link creation
without constructing an Express request. Those pressures motivate
`usecases-01`; they do not prove that every small Node.js service needs that
architecture from its first commit.

