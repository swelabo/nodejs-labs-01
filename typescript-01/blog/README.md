# `hexagonal-01/blog`

This hexagonal implementation preserves the blog's publication workflow while
placing a validated post port between the use cases and the Prisma/SQLite
adapter. The composition root wires the production adapter.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm test
```

The tests cover role checks, drafts, scheduled publication, public reads,
duplicate-slug behavior, and use-case execution against an in-memory port.

