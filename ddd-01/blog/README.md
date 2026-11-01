# `ddd-01/blog`

This DDD implementation preserves the hexagonal boundary while isolating the
publication language in a `Post` aggregate and immutable `Slug` value object.
Prisma models remain persistence details; use cases pass domain-approved data
to the post repository port.

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm run typecheck
npm test
```

The tests cover role checks, drafts, scheduled publication, public reads,
duplicate-slug behavior, domain invariants, architectural dependency rules,
and use-case execution against an in-memory port.

