# TypeScript compared with JavaScript

`typescript-01` keeps the hexagonal runtime shape and changes the language
contract. The JavaScript variants discover a malformed adapter when a test
calls the missing method; TypeScript can report an incompatible port before the
program runs. Neither compiler types nor generated Prisma types validate an
HTTP JSON payload, so runtime validation remains necessary.

| Concern | JavaScript hexagonal | TypeScript migration |
| --- | --- | --- |
| Port shape | runtime `require*Port` check | interface plus runtime check |
| HTTP input | repository/domain validation | same validation, with typed handlers where migrated |
| Adapter mapping | implicit object shape | compiler-visible method signatures |
| Test seam | memory object checked at runtime | memory object checked at compile time and runtime |
| Cost | fewer tool steps | compiler configuration, generated-client typing, and type boundaries |

The migration is valuable when a boundary has several implementations or a
large input/output vocabulary. It is not evidence that every JavaScript module
needs a type declaration; a small script may gain little from the compiler.
The `tsc --noEmit` and `tsx --test` commands make the tradeoff executable.

## Exercises

1. Remove one required method from a memory port and observe the TypeScript
   diagnostic and runtime validation.
2. Change a port return type and update the adapter mapping deliberately.
3. Explain why a type assertion can silence the compiler without validating
   data received from a browser.
