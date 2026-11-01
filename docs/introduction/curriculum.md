# Curriculum and learning strategy

This curriculum uses three familiar applications as repeated architectural
experiments: a URL shortener, a Pastebin-style snippet service, and a traditional
blog. Repetition is intentional. It gives us a stable domain against which to
observe the effect of persistence choices, use-case boundaries, dependency
direction, static types, and domain modeling.

## The six variants

| Variant | Primary change | Persistence baseline |
| --- | --- | --- |
| `simple-01` | direct request-handler organization | SQLite and parameterized SQL |
| `prisma-01` | ORM mapping and generated client | SQLite and Prisma |
| `usecases-01` | explicit application operations | SQLite and Prisma |
| `hexagonal-01` | ports, adapters, and dependency inversion | replaceable adapters |
| `typescript-01` | compile-time contracts | TypeScript and the hexagonal design |
| `ddd-01` | domain behavior, aggregates, and bounded contexts | Clean Architecture boundaries |

The table describes the teaching focus, not a claim that each later design is
universally better. A more elaborate boundary can improve change isolation while
increasing indirection and the amount of code a maintainer must understand.

## How to read an implementation

Start with the application README and canonical specification. Run the tests
before reading the implementation. Then follow one request from the HTTP entry
point to the database and back. The corresponding chapter explains the design
after the concrete path is familiar.

Each completed application records:

- the behavior it supports;
- the tests that provide evidence;
- the architecture it uses;
- costs and limitations;
- the next change that would motivate a more structured variant.

## What is deliberately postponed

The first six variants use server-rendered HTML with EJS, HTMX, Alpine.js, and
Tailwind CSS. React, Vue application frontends, Next.js, and a full SPA are not
part of this sequence. They are future comparison topics, not hidden
dependencies in the baseline applications.

