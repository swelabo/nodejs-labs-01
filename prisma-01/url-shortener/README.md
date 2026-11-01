# `prisma-01/url-shortener`

This is the first Prisma reimplementation of the URL shortener. Its observable
behavior matches `simple-01/url-shortener`, but persistence uses Prisma Client
and a SQLite driver adapter instead of direct SQL.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm test
npm start
```

The application code remains JavaScript. Prisma 7's default `prisma-client`
generator emits TypeScript, so this variant uses the JavaScript-compatible
`prisma-client-js` generator while retaining a TypeScript `prisma.config.ts`
tooling file. That distinction is deliberate and documented for comparison.

