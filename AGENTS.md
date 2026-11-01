# Agent Instructions

## Project goal

Build a reproducible, executable curriculum that teaches JavaScript, Node.js,
TypeScript, and architectural tradeoffs through eighteen independently runnable
applications. The source code, tests, specifications, and book are one teaching
system.

## Architectural rules

- Implement variants in the order defined by `ROADMAP.md`.
- Preserve earlier variants for comparison; do not replace them with later
  architectures.
- Keep each application runnable from its own directory.
- Keep canonical behavior architecture-neutral and record intentional deviations.
- Introduce one primary architectural concept per variant.
- Prefer explicit code over framework magic in introductory variants.

## Educational standards

- Assume strong general engineering experience but limited JavaScript and Node.js
  experience.
- Explain platform-specific behavior precisely, including differences from Python
  and Go.
- Demonstrate important claims with runnable code or tests.
- State benefits, costs, and appropriate use cases for every architecture.
- Treat code examples as code a reader may copy into a real project.

## Documentation and testing

- Keep the VitePress book synchronized with actual code.
- Use OpenAPI as an executable contract, not a decorative document.
- Test behavior, security boundaries, and architectural distinctions.
- Run relevant tests and `make docs-build` before declaring a milestone complete.
- Record research, decisions, investigations, and next actions in `.development/`.

## Prohibited shortcuts

- Do not generate untested scaffolding for future variants.
- Do not claim an application, chapter, or experiment is complete when it is not.
- Do not collect unnecessary personal analytics data.
- Do not store secrets in the repository or `.development/`.
- Do not perform destructive Git operations without explicit authorization.

