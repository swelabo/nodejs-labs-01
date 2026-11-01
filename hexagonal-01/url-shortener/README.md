# `hexagonal-01/url-shortener`

This implementation adds ports, adapters, and a composition root while
preserving the URL-shortener behavior from `usecases-01`. The use-cases depend on
the validated link port; the Prisma repository is one adapter selected by the
composition root.

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

