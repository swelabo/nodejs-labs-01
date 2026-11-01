# Roadmap

## Phase 0 — Foundation

- [x] Establish root repository conventions and Node.js baseline.
- [x] Establish VitePress book configuration and navigation.
- [x] Define canonical application specifications.
- [x] Define API, testing, and documentation standards.
- [ ] Complete the introductory book chapters and foundation verification.
- [ ] Prepare the detailed `simple-01/url-shortener` implementation plan.

## Phase 1 — `simple-01` (in progress)

Implement URL shortener, Pastebin, then blog using JavaScript, Express, raw
parameterized SQL, SQLite, EJS, HTMX, Alpine.js, and Tailwind CSS.

- [x] URL shortener core slice: API, redirects, persistence, tests, OpenAPI.
- [ ] URL shortener browser interface and remaining baseline controls.
- [x] Pastebin core slice: visibility, raw text, tags, search, tests, OpenAPI.
- [x] Pastebin browser interface and expiration cleanup; moderation remains.
- [x] Blog first slice: publication workflow, roles, public reads, tests, and OpenAPI.
- [x] Blog comments, moderation, feeds, sitemap, hierarchy checks, and one-time challenge.
- [ ] Blog accounts, richer CAPTCHA, media, and full administration.

## Phase 2 — `prisma-01` (in progress)

Reimplement the same applications with Prisma while preserving observable
behavior and comparing ORM queries with raw SQL.

- [x] URL shortener: Prisma schema, migration, JavaScript client, tests.
- [x] Pastebin: Prisma schema, migration, JavaScript client, tests.
- [x] Blog: Prisma schema, migration, JavaScript client, tests.

## Phase 3 — `usecases-01` (in progress)

Separate application operations from HTTP delivery with explicit use cases.

- [x] URL shortener: explicit use-case layer and delegation test.
- [x] Pastebin: explicit use-case layer and delegation test.
- [x] Blog: explicit use-case layer and delegation test.

## Phase 4 — `hexagonal-01` (in progress)

Introduce ports, adapters, dependency inversion, and composition roots.

- [x] URL shortener: link port, Prisma adapter, composition root, tests.
- [x] Pastebin: snippet port, Prisma adapter, composition root, tests.
- [x] Blog: post port, Prisma adapter, composition root, tests.

## Phase 5 — `typescript-01` (in progress)

Migrate the hexagonal implementation to TypeScript and teach meaningful static
contracts.

- [x] URL shortener: typed port/use-case contracts, `tsx` tests, and typecheck.
- [x] Pastebin: typed port/use-case contracts, `tsx` tests, and typecheck.
- [ ] Blog.

## Phase 6 — `ddd-01`

Introduce tactical DDD, domain events, bounded contexts, and Clean Architecture
where the domain complexity justifies them.

## Phase 7 — Consolidation

Complete cross-variant comparisons, contract verification, security review, and
the final architecture guide.

