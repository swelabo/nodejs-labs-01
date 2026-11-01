# `simple-01/pastebin`

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

The API listens on `http://localhost:3002`. The development identity is supplied
with `X-User-Id`; anonymous creation is enabled by default for this baseline.

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

This slice includes creation, visibility, expiration, raw views, tags, search,
pagination, owner-only edit and delete, size limits, and an OpenAPI document. It
does not yet include accounts, syntax-highlighting output, moderation, or a
browser dashboard.

