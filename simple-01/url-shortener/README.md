# `simple-01/url-shortener`
The browser surface uses local EJS, HTMX, Alpine.js, and Tailwind assets; run `npm run frontend:build` to reproduce it.

This is the first implementation in the architecture laboratory. It keeps the
application deliberately direct: Express route handlers call a small SQLite
repository, validate request data, and format responses. The design is useful as
a baseline because later variants can change one architectural boundary while
retaining the same observable behavior.

## Requirements

- Node.js 26.13.0 or newer;
- npm; and
- GNU Make for the documented commands.

## Run it

```sh
cp .env.example .env
npm install
make db-init
make db-seed
make start
```

The server listens on `http://localhost:3001` by default. Anonymous creation is
disabled by default. API management requests use the development identity
`dev-user` through the `X-User-Id` header; this is a teaching seam, not an
authentication system.

Run the tests with:

```sh
make test
```

## API examples

Create a link:

```sh
curl -X POST http://localhost:3001/api/v1/links \
  -H 'content-type: application/json' \
  -H 'x-user-id: dev-user' \
  -d '{"destination_url":"https://nodejs.org","alias":"node"}'
```

Resolve it with `curl -i http://localhost:3001/node`. The response is a `302`
redirect with a `Location` header. Analytics record the request time and a
coarse referrer host when a valid `Referer` header is present; raw IP addresses
are not stored.

## Scope and limitations

This slice includes link creation, custom aliases, expiration, activation,
deletion, search, pagination, redirects, aggregate click counts, QR generation,
a browser dashboard, and a bounded in-memory creation rate limit. It does not
yet include real authentication or a distributed rate limiter. The limitations
are intentional and are recorded so the next variant can be compared against a
known baseline.

