# `usecases-01/url-shortener`

This implementation adds an explicit application use-case layer while preserving
the URL-shortener behavior from `prisma-01`. HTTP routes delegate workflows to
`src/usecases.js`; persistence remains an adapter behind that layer.

```sh
npm install
npm run db:generate
npm run db:migrate
npm test
npm start
```

The application code remains JavaScript. Prisma 7's default `prisma-client`
generator emits TypeScript, so this variant uses the JavaScript-compatible
`prisma-client-js` generator while retaining a TypeScript `prisma.config.ts`
tooling file. That distinction is deliberate and documented for comparison.

