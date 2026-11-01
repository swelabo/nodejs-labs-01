# Technology decisions

Research checkpoint: 2026-11-01.

This document records the initial baseline for Phase 0. Versions are selected
from current package metadata and official project documentation; application
variants must re-check compatibility before adding their own dependencies.

## Baseline

| Technology | Selection | Reason |
| --- | --- | --- |
| Node.js | 26.13.0 LTS | The requested Node.js 26 baseline is now LTS and supported through April 2029. |
| npm | shipped with Node.js | Root package manager and lockfile format for the foundation. |
| VitePress | 1.6.4 | Current stable npm release; VitePress requires Node.js 22+. |
| Express | 5.3.0 | Current stable Express 5 line for the first application milestone. |
| TypeScript | 5.9.3 | Pinned compiler used by the TypeScript and DDD variants; introduced only after the JavaScript variants. |
| Prisma | 7.10.1 | Stable Prisma 7 line; Prisma 8 is a release candidate and its SQLite extension is experimental. |
| SQLite | system/library integration | Small, inspectable relational database suitable for local architectural experiments. |

## Sources and findings

- [Node.js releases](https://nodejs.org/en/about/previous-releases) lists Node.js
  26 as LTS and its planned end of life as April 2029.
- [Node.js 26.13.0 release](https://nodejs.org/en/blog/release/v26.13.0) confirms
  the LTS transition on 2026-10-28.
- [VitePress getting started](https://vitepress.dev/guide/getting-started) states
  that VitePress requires Node.js 22 or newer and is ESM-only.
- [Prisma SQLite connector](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite)
  documents Prisma ORM 7 SQLite configuration and driver adapters.
- [Prisma supported versions](https://www.prisma.io/docs/orm/supported-versions)
  identifies Prisma ORM 8 as a release-candidate line and notes that its SQLite
  library is experimental.
- [Express documentation](https://expressjs.com/en/5x/api.html) documents the
  Express 5 API and middleware contract used by the applications.
- [Node.js test runner](https://nodejs.org/api/test.html) documents the built-in
  `node:test` API used in the JavaScript variants.
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  is the primary reference for the compiler and type-system chapters.
- [HTMX documentation](https://htmx.org/docs/), [Alpine.js documentation](https://alpinejs.dev/start-here),
  [Tailwind CSS documentation](https://tailwindcss.com/docs/installation), and
  [EJS documentation](https://ejs.co/) describe the server-driven frontend
  tools used or discussed by the baseline.
- [OpenAPI specification](https://spec.openapis.org/oas/latest.html) defines
  the contract format; the repository uses OpenAPI 3.1 artifacts.
- [SQLite documentation](https://www.sqlite.org/docs.html) is the primary
  reference for SQL, transactions, constraints, and operational behavior.

## Prisma compatibility checkpoint

The Prisma variant will keep application source code in JavaScript. Prisma's
current configuration and generated-client workflow may require TypeScript
configuration files even when the application itself does not use TypeScript.
That distinction will be documented and tested in `prisma-01`; it must not
silently become a TypeScript application architecture.

The variant will prefer the stable Prisma 7 line. A move to Prisma 8 requires a
new decision record after the SQLite extension and generated-client workflow are
stable enough for an educational baseline.

