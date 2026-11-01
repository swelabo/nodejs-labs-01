# Progress

## Current milestone

Phase 7 — consolidation and acceptance audit.

## Completed

- Initialized the main repository on `wip`.
- Initialized `.development/` as an independent repository on `main`.
- Added root conventions, Makefile, package manifest, and agent instructions.
- Recorded the initial technology baseline.
- Created the VitePress book outline and canonical specifications.
- Implemented the first URL-shortener slice with SQLite, Express, redirects,
  ownership checks, expiration, analytics, OpenAPI, tests, and documentation.
- Implemented the Pastebin core slice with visibility controls, raw text,
  ownership checks, tags, search, OpenAPI, tests, and documentation.
- Prepared the blog data model, OpenAPI contract, and first implementation plan.
- Implemented the blog first slice with roles, drafts, scheduling, public reads,
  escaped rendering, and OpenAPI tests.
- Implemented `prisma-01/url-shortener` with Prisma 7.10.1, migration, JavaScript
  client generation, API tests, and comparison documentation.
- Implemented `prisma-01/pastebin` with Prisma 7.10.1, migration, visibility,
  raw text, tags, search, ownership, and tests.
- Implemented `prisma-01/blog` with Prisma 7.10.1, migration, role checks,
  publication timing, slug uniqueness, and tests.
- Implemented `usecases-01/url-shortener` by extracting explicit application
  operations and testing HTTP delegation.
- Added explicit use-case layers to `usecases-01/pastebin` and
  `usecases-01/blog`, preserving their Prisma behavior and adding delegation
  tests.
- Implemented `hexagonal-01/url-shortener` with a validated port, Prisma adapter,
  composition root, and in-memory port test.
- Implemented `hexagonal-01/pastebin` and `hexagonal-01/blog` with validated
  ports, Prisma adapters, composition roots, and in-memory port tests.
- Implemented `typescript-01/url-shortener` with typed port/use-case contracts,
  `tsx` execution, and a passing TypeScript compiler check.
- Implemented `typescript-01/pastebin` with a typed snippet port, `tsx` tests,
  and a passing TypeScript compiler check.
- Implemented `typescript-01/blog` with a typed post port, `tsx` tests, and a
  passing TypeScript compiler check.
- Implemented the initial `ddd-01` domain aggregates for all three applications; the blog
  includes publication invariants, an immutable slug value object, and an
  infrastructure dependency test.

## Verification

- `npm install` — passed under Node 22.12.0 with an engine warning because the
  project baseline is Node 26.13.0.
- `npm run docs:build` — passed.
- `npm run docs:lint` — passed.
- `make test` — passed: 20 tests under Node.js 26.13.0.
- `make simple-url-shortener-test` — passed.
- Manual database initialization, seed, server startup, API creation, and `302`
  redirect smoke test — passed.
- `make pastebin-test` — passed: 5 tests under Node.js 26.13.0.
- `make prisma-url-shortener-test` — passed: 2 tests under Node.js 26.13.0.
- `make prisma-pastebin-test` — passed: 2 tests under Node.js 26.13.0.
- `make prisma-blog-test` — passed: 2 tests under Node.js 26.13.0.
- `make usecases-url-shortener-test` — passed: 3 tests under Node.js 26.13.0.
- `usecases-01/pastebin` — passed: 3 tests.
- `usecases-01/blog` — passed: 3 tests.
- `make hexagonal-url-shortener-test` — passed: 4 tests under Node.js 26.13.0.
- `make hexagonal-pastebin-test` — passed: 4 tests under Node.js 26.13.0.
- `make hexagonal-blog-test` — passed: 4 tests under Node.js 26.13.0.
- `make typescript-url-shortener-typecheck` — passed under Node.js 26.13.0.
- `make typescript-url-shortener-test` — passed: 4 tests under Node.js 26.13.0.
- `make typescript-pastebin-typecheck` — passed under Node.js 26.13.0.
- `make typescript-pastebin-test` — passed: 4 tests under Node.js 26.13.0.
- `make typescript-blog-typecheck` — passed under Node.js 26.13.0.
- `make typescript-blog-test` — passed: 4 tests under Node.js 26.13.0.
- `ddd-01/url-shortener` — passed typecheck and 5 tests.
- `ddd-01/pastebin` — passed typecheck and 5 tests.
- `ddd-01/blog` — passed typecheck and 6 tests.
- `npm run verify:apps` — passed across all 18 application variants and their
  TypeScript compiler checks.
- Expanded the VitePress book with executable chapters for modules, async
  programming, Node testing, Express, SQLite, TypeScript contracts,
  server-driven frontend work, verification, and operations.
- Added six-variant architecture and application matrices plus a security
  baseline tied to the actual implementation boundaries.
- Added OpenAPI documents to every application variant and an executable
  contract-presence/path verifier.
- Added blog domain events and an explicit transaction boundary with tests that
  document in-process event semantics and the absence of durable delivery.
- Added and tested a double-submit CSRF boundary for authenticated mutations in
  the direct Blog session flow.
- Corrected the direct URL shortener's anonymous-creation boundary so a missing
  identity cannot silently become the development user; added a regression test.
- Added `.development/DECISIONS.md`, `.tool-versions`, and a CI workflow that
  runs contracts, seeded applications, lifecycle, and documentation gates.
- Added a structure verifier proving all eighteen local Makefiles and package
  manifests expose the required lifecycle commands.
- CI now installs every application lockfile before running the root gates, so
  the workflow models a clean checkout rather than relying on local modules.
- Added a dependency-audit gate; all eighteen runtime dependency graphs report
  zero vulnerabilities at the high-severity threshold.
- Added explicit SQL-injection, oversized-request, and concurrent-alias
  security tests to the direct application baselines.
- Added explanatory comments at representative SQL, Prisma, port, TypeScript,
  and domain boundaries; focused tests and typechecks remain green.
- Completed the technology research references for Express, Node testing,
  TypeScript, SQLite, HTMX, Alpine.js, Tailwind, EJS, and OpenAPI.
- Added dedicated Prisma, DDD/Clean Architecture, production, and all-variant
  comparison chapters with Mermaid diagrams and exercises.
- Added tooling, concurrency, Express security, accessibility, reflections,
  glossary, and official references sections to the book.
- Added a dedicated TypeScript comparison and an eighteen-entry application
  reflection matrix covering design, testing, performance, security, and
  evolution tradeoffs.
- Extended the DDD Blog with a domain factory, publication policy service,
  aggregate-oriented repository abstraction, and identity context mapping.
- Added idempotent seed commands to all eighteen applications; the matrix now
  initializes, migrates, seeds, type-checks where applicable, and tests each
  variant.
- Added `npm run verify:start`, which starts and gracefully stops all eighteen
  servers on ephemeral ports successfully.

## Known limitations

- The URL shortener still lacks real authentication and a distributed rate
  limiter.
- Pastebin still lacks a browser dashboard, accounts, moderation, and syntax
  highlighting output.
- Blog first slice is implemented and verified.
- Blog comments, moderation, feeds, sitemap generation, hierarchy checks, and a
  one-time challenge are now implemented and tested.
- Blog administrator-only user-role management is implemented and tested.
- Blog password hashing, session cookies, login, logout, and administrator user
  creation are implemented and tested.
- The book currently contains the foundation, URL-shortener, Pastebin, and blog
  chapters.
- Dependency versions require review when the first application begins.

## Next action

Complete the final contract, security, and acceptance audit.

