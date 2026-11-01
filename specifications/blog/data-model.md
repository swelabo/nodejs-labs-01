# Blog data model

This model is architecture-neutral. The first implementation may use direct SQL,
but later variants must preserve the observable publication and authorization
rules.

## Core tables

- `users`: identity, slug, display name, and role.
- `posts`: author, slug, title, body, status (`draft`, `scheduled`, `published`),
  publication time, and timestamps.
- `pages`: author, slug, title, body, publication state, and timestamps.
- `categories`: slug, name, and optional parent category.
- `tags`: slug and name.
- `post_categories`: many-to-many post/category relation.
- `post_tags`: many-to-many post/tag relation.
- `comments`: post, optional author identity, body, moderation state, and times.
- `captcha_challenges`: one-time challenge digest, expiry, and consumed time.

## Invariants

1. A published post has a publication time and a unique public slug.
2. A draft or future-scheduled post is absent from public routes, feeds, and
   sitemaps.
3. A category cannot be its own ancestor, directly or transitively.
4. A comment is not publicly visible until moderation marks it approved.
5. A CAPTCHA challenge is bound to one submission, expires, and cannot be reused.
6. Editors can manage posts and comments according to role; authors cannot gain
   administrator capabilities by changing request fields.

## Deliberate first-slice boundary

The first blog slice should implement users, posts, categories, tags, publication
state, public post reads, and editor authorization. Comments, feeds, taxonomy
hierarchies, and the self-hosted challenge follow as separate tested increments.

