# Progress

## Current milestone

Phase 1 — `simple-01/url-shortener` core slice.

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

Add session hardening, richer CAPTCHA protections, and media handling before
starting Prisma.

