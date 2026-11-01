# TypeScript contracts

TypeScript adds a compile-time description of a boundary; it does not validate
JSON received over HTTP and it does not change JavaScript's runtime semantics.
That is why the variants retain runtime validation in repositories and domain
objects.

The useful migration seam is the port:

```ts
export interface PostPort {
  create(userId: string | null, role: string, input: Record<string, unknown>): Promise<Record<string, unknown>>
  publicBySlug(slug: string): Promise<Record<string, unknown>>
}
```

The interface makes missing capabilities visible to the compiler and makes a
memory adapter straightforward to write. It does not make every implementation correct;
the DDD variants add runtime invariants and tests. The initial teaching config
uses `tsc --noEmit` and `tsx`; strictness is relaxed while the generated Prisma
client and Express middleware are migrated incrementally, a tradeoff recorded in
each README.
