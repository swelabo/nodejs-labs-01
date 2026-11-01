# Prisma comparison

`prisma-01/url-shortener` preserves the direct variant's HTTP behavior while
changing persistence. The raw-SQL implementation writes explicit SQL and maps
rows manually. The Prisma implementation expresses the same operations through a
generated client and a SQLite driver adapter.

The change improves schema-to-client consistency and reduces repetitive row
mapping, but it adds generated artifacts, migration tooling, adapter knowledge,
and a compatibility boundary. Prisma 7's default generator emits TypeScript;
the JavaScript application therefore uses `prisma-client-js` while retaining a
TypeScript configuration file for the CLI. That is a tooling compromise, not a
silent migration of the application language.

Run the comparison with:

```sh
make simple-url-shortener-test
make prisma-url-shortener-test
```

The two suites verify the same essential creation, redirect, uniqueness, and
ownership behavior. The architecture remains direct in both variants; the
use-case boundary is intentionally postponed to `usecases-01`.

