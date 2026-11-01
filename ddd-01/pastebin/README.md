# `ddd-01/pastebin`
The server-rendered surface uses local EJS, HTMX, Alpine.js, and Tailwind assets; run `npm run frontend:build` to reproduce it.

This DDD implementation preserves the Pastebin contract while placing a
validated `Snippet` value boundary between the use cases and the Prisma/SQLite
adapter. The composition root is the only place that wires the production
adapter.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm test
```

The tests cover public/private visibility, raw text, tags, search, ownership,
and use-case execution against an in-memory port.

