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
- `make test` — passed: 10 tests under Node.js 26.13.0.
- `make simple-url-shortener-test` — passed.
- Manual database initialization, seed, server startup, API creation, and `302`
  redirect smoke test — passed.
- `make pastebin-test` — passed: 4 tests under Node.js 26.13.0.

## Known limitations

- The URL shortener still lacks real authentication and a distributed rate
  limiter.
- Pastebin still lacks a browser dashboard, accounts, moderation, and syntax
  highlighting output.
- Blog first slice is implemented and verified.
- Blog still lacks comments, moderation, feeds, sitemaps, hierarchical taxonomy,
  CAPTCHA, and full administration.
- The book currently contains the foundation, URL-shortener, and Pastebin
  chapters.
- Dependency versions require review when the first application begins.

## Next action

Extend the blog with comments, moderation, feeds, sitemaps, and taxonomy rules.

