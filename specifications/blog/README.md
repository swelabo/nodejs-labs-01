# Blog specification

## Essential behavior

The blog publishes posts and pages with slugs, authors, categories, tags, and
publication state. Drafts are visible to authorized editors; published content
is visible publicly at its permalink. Posts support comments, moderation, search,
archives, feeds, and sitemap output.

The domain includes many-to-many post/tag relationships, hierarchical categories,
role-aware administration, scheduled publication, and a self-hosted challenge
for comment submission. The challenge is one anti-abuse measure, not a claim of
strong bot protection.

## Public routes

- `/` — published post listing;
- `/posts/{slug}` — a published post;
- `/pages/{slug}` — a published page;
- `/author/{slug}` — an author's published posts;
- `/category/{slug}` and `/tag/{slug}` — filtered listings;
- `/archive/{year}` and `/archive/{year}/{month}` — date archives;
- `/search?q=...` — bounded search;
- `/feed.xml` — RSS or Atom feed;
- `/sitemap.xml` — published URL inventory.

## API surface

The first API contract includes `POST`, `GET`, `PATCH`, and `DELETE` operations
for `/api/v1/posts`, plus category/tag management, custom taxonomy terms,
comments, authentication, and administrator-only site configuration. Exact
schemas are versioned with each implementation and must preserve publication
and authorization semantics.

The direct reference also implements a deliberately bounded media scope: an
administrator may upload PNG, JPEG, GIF, or WebP bytes up to 5 MiB using the
raw binary API, then serve or delete them. Filesystem storage and arbitrary
document formats remain outside this curriculum.

## Required tests

- drafts and scheduled posts are not publicly visible early;
- published slugs resolve and remain unique;
- editor and administrator permissions differ where specified;
- taxonomy relationships are consistent;
- moderated comments are not published automatically;
- challenge expiry and one-time use are enforced;
- public routes escape untrusted content;
- feeds and sitemaps exclude unpublished resources.

