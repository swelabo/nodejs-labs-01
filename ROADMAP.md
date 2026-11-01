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
- [ ] Pastebin browser interface, expiration cleanup, and moderation controls.
- [ ] Blog.

## Phase 2 — `prisma-01`

Reimplement the same applications with Prisma while preserving observable
behavior and comparing ORM queries with raw SQL.

## Phase 3 — `usecases-01`

Separate application operations from HTTP delivery with explicit use cases.

## Phase 4 — `hexagonal-01`

Introduce ports, adapters, dependency inversion, and composition roots.

## Phase 5 — `typescript-01`

Migrate the hexagonal implementation to TypeScript and teach meaningful static
contracts.

## Phase 6 — `ddd-01`

Introduce tactical DDD, domain events, bounded contexts, and Clean Architecture
where the domain complexity justifies them.

## Phase 7 — Consolidation

Complete cross-variant comparisons, contract verification, security review, and
the final architecture guide.

