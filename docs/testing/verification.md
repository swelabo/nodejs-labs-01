# Verification honesty

A passing test proves only what it covers. The project therefore records the
scope of each gate:

- `npm test` covers the direct JavaScript baseline;
- `npm run verify:apps` covers all eighteen application suites;
- `npm run verify:structure` checks each local manifest and Makefile;
- `npm run verify:contracts` checks every OpenAPI artifact and essential paths;
- `npm run verify:dependencies` audits runtime dependencies across all variants;
- each Prisma-backed app requires generated client and deployed migrations;
- `npm run docs:build` proves the VitePress site renders;
- `npm run docs:lint` checks prose rules and internal links;
- `npm audit --omit=dev` is run per application when a dependency milestone is
  committed.

Prisma-backed suites set `NODE_ENV=test`, prepare a separate `data/test.db`
through the local migration set, and only clear that test database. The normal
development database is never the suite's reset target. This distinction matters
because a test that deletes rows from a developer's seeded database is not
reproducible isolation.

No one command proves browser accessibility, production capacity, backup
recovery, or distributed rate limiting. Those claims require separate tests and
operational evidence; the book should say so rather than infer them from a
green unit suite.
