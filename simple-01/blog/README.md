# `simple-01/blog`

This is the first blog implementation in the direct-handler variant. It teaches
publication state, role-aware administration, slugs, taxonomy relations, and
public rendering before later variants introduce use cases and domain modeling.

## Run it

```sh
npm install
make db-init
make start
```

The application listens on `http://localhost:3003`. Send `X-User-Id: dev-editor`
for editor operations. Administrators can create accounts, which authenticate
with scrypt-hashed passwords and receive HttpOnly session cookies. The header is
retained as a development authorization seam, not a production identity
provider.

## Behavior

Posts begin as drafts. Only an editor can create or edit them. A published post
is public when its `publish_at` is absent or not in the future. Drafts and future
scheduled posts are excluded from public lists and slug reads. Bodies are escaped
in the browser view; this slice does not interpret Markdown or HTML.

## Scope

The baseline includes posts, roles, categories, tags, publication workflow,
search, pagination, public rendering, comments pending moderation, feeds,
sitemaps, one-time arithmetic challenges, hierarchy-cycle checks, and OpenAPI.
The development baseline also includes administrator-only user-role management.
The `X-User-Id` identity remains a local teaching seam; account recovery, CSRF
defenses, audit logging, and secure deployment configuration remain later work.

