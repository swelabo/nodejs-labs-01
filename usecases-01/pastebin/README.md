# `prisma-01/pastebin`

This Prisma 7.10.1 implementation preserves the direct Pastebin contract while
moving persistence to Prisma Client and SQLite. Application code remains
JavaScript; the Prisma CLI uses `prisma.config.ts`.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm test
```

The tests cover public/private visibility, raw text, tags, search, and ownership
against the migrated SQLite schema.

