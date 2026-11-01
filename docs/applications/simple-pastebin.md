# The direct-handler Pastebin

The `simple-01/pastebin` application stores untrusted text snippets and makes
visibility rules explicit. It is the second application in the direct-handler
variant, so it retains the same broad choices as the URL shortener: Express
routes, parameterized SQLite, small repository functions, and API tests.

## Visibility is an authorization rule

Public snippets appear in collection searches. Unlisted snippets can be read by
someone who knows the identifier, but are excluded from collection results.
Private snippets require the owner identity. An unauthorized private read
returns the same `404 Not Found` shape as a missing snippet; this avoids turning
the identifier into an oracle for private-resource existence.

An unlisted URL is therefore not equivalent to authenticated private access. It
is an obscured address, not an authorization decision.

## Untrusted content

The API stores `<script>` as text and the raw endpoint returns `text/plain`.
This is different from rendering content safely in HTML. A future browser view
must escape text before inserting it into a document, and syntax highlighting
must operate after that trust boundary is defined. A language label does not make
the source safe.

## Persistence and tests

Tags use a separate relation rather than a comma-separated column. The tests use
an in-memory SQLite database and cover raw content, visibility, private-resource
non-disclosure, owner authorization, tag validation, search, and OpenAPI paths.

```sh
make -C simple-01/pastebin test
```

The current slice includes scrypt-backed accounts, expiring HttpOnly sessions,
CSRF-protected mutations, a small authenticated administration listing, safe
JavaScript/TypeScript keyword highlighting, and an EJS browser dashboard. Full
moderation remains a deliberately separate extension with its own policy tests.

