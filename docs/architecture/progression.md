# Architecture progression

The variants are a sequence of experiments, not a ranking. Each step earns its
complexity by responding to a limitation observed in the previous step.

```text
HTTP handlers + SQL
        ↓ repeated persistence code
Prisma persistence
        ↓ operations need independent tests
Explicit use cases
        ↓ infrastructure leaks into application logic
Ports and adapters
        ↓ runtime contracts are implicit
TypeScript contracts
        ↓ domain rules exceed CRUD boundaries
DDD and Clean Architecture
```

The arrows describe likely pressure, not a universal migration path. A small
internal tool may remain in the first variant for its entire life. Architecture
is valuable when its boundaries reduce the cost or risk of a change that the
system actually needs.

## What remains stable

The three applications retain stable essential behavior and versioned API
conventions. A short link still resolves to a destination, a snippet still has
visibility rules, and a blog still has publication state. Stable behavior lets
tests compare implementations without mistaking a new feature for an
architectural improvement.

## What changes

The location of decisions changes. In the simple variant, an HTTP handler may
validate input, issue SQL, and format the response. In the use-case variant,
application operations own the workflow. In the hexagonal variant, the workflow
depends on ports and adapters implement those ports. Later variants make the
contracts and domain invariants explicit.

Every completed variant includes a reflection on developer experience, testing,
performance, security, and future evolution. That reflection is part of the
implementation, not an after-the-fact claim that the chosen pattern won.

