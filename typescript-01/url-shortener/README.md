# `typescript-01/url-shortener`

This implementation preserves the hexagonal URL-shortener boundary while
moving the application contracts, use cases, HTTP entry point, and Prisma
adapter into TypeScript. The Prisma repository remains an adapter selected by
the composition root.

```sh
npm install
npm run db:generate
npm run db:migrate
npm run typecheck
npm test
npm start
```

TypeScript uses `tsx` for the executable development and test loop, and
`tsc --noEmit` validates the source without a build directory. The port
contract is explicit in `src/ports.ts`; `strict` is initially relaxed because
the Prisma-generated JavaScript client and Express middleware are migrated
incrementally in this teaching sequence.

