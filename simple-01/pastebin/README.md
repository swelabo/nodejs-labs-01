# `simple-01/pastebin`
The browser surface uses local EJS, HTMX, Alpine.js, and Tailwind assets; run `npm run frontend:build` to reproduce it.

This direct-handler Pastebin implementation stores untrusted text snippets in
SQLite. Its primary teaching boundary is visibility: public snippets are
discoverable, unlisted snippets require a permalink, and private snippets
require the owner identity.

## Run it

```sh
npm install
make db-init
make start
```

The API listens on `http://localhost:3002`. Anonymous creation is enabled by
default for this baseline; registered accounts use scrypt-backed passwords,
HttpOnly sessions, and CSRF tokens.

## Security model

Snippet content is never interpreted as HTML by the API. The raw endpoint sends
`text/plain`, and the JSON endpoint returns content as a string. A later browser
renderer must HTML-escape the content before inserting it into a page. Syntax
highlighting is a separate transformation and must not be treated as a security
boundary.

An unlisted URL is not private authorization. Anyone with the permalink can read
an unlisted snippet. Private snippets return the same not-found response to an
unauthorized caller so the API does not disclose whether a private identifier
exists.

## Scope

This slice includes creation, visibility, expiration, raw views, safe
syntax-highlighting output, tags, search, pagination, owner-only edit and
delete, size limits, account sessions, a small authenticated admin listing, and
an OpenAPI document. Anonymous creation remains an explicit configuration
option; full moderation is intentionally outside this baseline.

