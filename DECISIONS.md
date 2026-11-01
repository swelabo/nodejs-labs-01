# Decisions

## D-001: Node.js 26.13.0 is the initial runtime baseline

Node.js 26.13.0 is the current LTS release at the start of this project. The
version is pinned in `.nvmrc`, and the root package requires at least that
version. The baseline can be revisited when a later implementation exposes a
compatibility constraint.

## D-002: VitePress 1.6.4 is the book baseline

VitePress 1.6.4 is the latest stable npm release found during the Phase 0
research checkpoint. The book uses ESM and the supported Node.js 22+ runtime
floor is satisfied by Node.js 26.

## D-003: Prisma 7.10.1 is the planned ORM baseline

Prisma 8 is a release candidate and its SQLite extension is experimental.
Prisma 7.10.1 is therefore the planned stable ORM baseline. The Prisma variant
will keep application code in JavaScript while documenting any TypeScript-based
configuration required by the toolchain.

