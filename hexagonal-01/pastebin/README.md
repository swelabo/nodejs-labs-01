# `hexagonal-01/pastebin`

This hexagonal implementation preserves the Pastebin contract while placing a
validated snippet port between the use cases and the Prisma/SQLite adapter.
The composition root is the only place that wires the production adapter.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm test
```

The tests cover public/private visibility, raw text, tags, search, ownership,
and use-case execution against an in-memory port.

