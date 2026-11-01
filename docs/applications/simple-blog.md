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

The direct implementation also supports scrypt-backed accounts and expiring
session cookies. `X-User-Id` remains an explicitly labeled local seam for
architecture tests; it is not presented as production authentication.

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

Comments enter a pending state and become public only after editor moderation.
Submission requires a short-lived, one-time arithmetic challenge. The challenge
is an abuse-control layer, not strong bot protection; rate limiting, moderation,
and accessibility remain necessary.

The application also emits a small Atom feed and sitemap from the same public
publication predicate. This keeps drafts and future posts out of syndication and
search-engine inventories.

## Static pages and permalinks

Published pages are stored separately from posts and are addressed by a stable
slug at `/pages/:slug`. The page query applies the same public-state boundary as
post queries: drafts and future publications return a not-found response rather
than leaking their existence. The browser route and `/api/v1/pages/:slug` use the
same repository function, which keeps the HTML and API representations aligned.

The direct variant now implements author pages, yearly/monthly archives,
category/tag discovery, and bounded media management. Arbitrary custom-taxonomy
administration is represented by a generic taxonomy/term API with scoped
hierarchy validation. Media accepts only bounded, signature-checked image bytes
and stores them in SQLite; it is not intended to imply a complete WordPress
media library.

Editors can create and publish pages through the API and use the escaped `/admin`
dashboard to inspect post/page status. The dashboard uses the same development
identity seam as the API; it is a teaching surface, not a production login.

Run the tests with:

```sh
make -C simple-01/blog test
```

