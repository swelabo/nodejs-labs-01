# The direct-handler blog

The `simple-01/blog` application is the first domain-rich slice in the direct
architecture. It introduces publication state, roles, slugs, and taxonomy
relations while keeping the request flow visible in Express handlers and raw
SQLite queries.

## Publication is a policy

Posts are created as drafts. A public query selects only posts whose status is
`published` and whose publication time is not in the future. This rule is applied
to both collection queries and slug reads, so a scheduled post cannot leak
through an individual URL while remaining absent from the homepage.

The development identity uses `X-User-Id: dev-editor` as an editor seam. It is
not authentication. A later implementation must replace that seam with a real
identity and authorization boundary without weakening the publication invariant.

## Why the blog is the capstone domain

The schema already has users, posts, categories, tags, and many-to-many join
tables. Future increments add comments, moderation, feeds, sitemaps, hierarchical
taxonomies, and one-time CAPTCHA challenges. These features create real domain
invariants that make the later use-case, hexagonal, and DDD comparisons useful.

## Untrusted post bodies

The first browser view uses escaped EJS interpolation and displays the body as
text. It does not interpret Markdown or HTML. Rendering richer content is a
separate security decision; accepting a `body` string is not permission to emit
it as markup.

Run the tests with:

```sh
make -C simple-01/blog test
```

