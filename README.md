# Node.js Architecture Labs

Node.js Architecture Labs is an executable curriculum for an experienced Python
and Go developer who is learning JavaScript, Node.js, TypeScript, and software
architecture through controlled comparisons.

The repository will implement three applications across six architectural
variants:

- a URL shortener;
- a Pastebin-style snippet service; and
- a traditional blog engine.

The repository now contains eighteen independently runnable implementations,
the canonical contracts, executable verification gates, and the VitePress
book. Later variants intentionally document narrower feature slices where the
architecture experiment would otherwise be obscured by duplicated product
work.

## Start the book

```sh
npm install
npm run docs:dev
```

Build and inspect the static site with:

```sh
npm run docs:build
npm run docs:preview
```

The current runtime baseline is Node.js 26.13.0. See
[`docs/research/technology-decisions.md`](docs/research/technology-decisions.md)
for the version and compatibility record.

## Repository map

- `docs/` — the VitePress technical book.
- `specifications/` — architecture-neutral application contracts.
- `simple-01/` through `ddd-01/` — implementation variants added in sequence.
- `.development/` — a separate private engineering-memory repository; it is
  intentionally ignored by the main repository.

## Status

Phase 7 consolidation is in progress. All six variant families, frontend
assets, lifecycle checks, contracts, tests, and documentation builds are
present; the remaining work is the final requirement-by-requirement audit.

