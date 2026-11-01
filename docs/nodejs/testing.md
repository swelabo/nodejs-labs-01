# Testing with Node.js

The built-in `node:test` runner is sufficient for the introductory variants.
`supertest` sends requests directly to an Express application without opening a
TCP port, which keeps HTTP tests deterministic. Each test creates or clears its
own SQLite state; a shared long-lived database would make ordering accidental.
Prisma-backed suites prepare a separate `data/test.db` from migrations before
running and never reset the development database. The direct SQLite suites use
in-memory databases where the app factory allows it.

The repository's test matrix has three layers:

1. behavior tests prove the API and persistence contract;
2. delegation tests prove that HTTP calls use the application boundary;
3. domain and architecture tests prove that invariants and dependency direction
   survive refactoring.

Run `npm run verify:apps` at the root. It executes all eighteen applications and
also runs `tsc --noEmit` for TypeScript and DDD variants. A green root test alone
is intentionally narrower than this matrix.
