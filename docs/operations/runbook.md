# Local operations runbook

Use the Node.js version pinned in `.nvmrc` through asdf, then install the root
dependencies. For a Prisma application, run `npm install`, `npx prisma generate`,
and `npx prisma migrate deploy` from that application's directory. Run
`npm run db:seed` to load idempotent teaching data. Start with its `npm start`
command and stop it with SIGTERM so the server can close its
listener and database connection.

Before a milestone is considered complete, run:

```sh
npm run verify:apps
npm run verify:start
npm run docs:build
npm run docs:lint
```

The local SQLite files are disposable test artifacts and are ignored by Git.
Do not put credentials in `.env`, lockfiles, or `.development/`; use the
`.env.example` files as documentation only.
