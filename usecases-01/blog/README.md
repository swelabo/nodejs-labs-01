# `usecases-01/blog`

This Prisma 7.10.1 implementation preserves the direct blog's publication
workflow while moving persistence to Prisma Client and SQLite. Application code
remains JavaScript.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm test
```

The slice covers role checks, drafts, scheduled publication, public post reads,
published static-page reads, and duplicate-slug behavior. Author/archive pages,
comments, and administration remain direct-variant scope so the use-case
experiment isolates application workflow boundaries.

