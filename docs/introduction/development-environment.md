# Development environment

The foundation uses Node.js 26.13.0, npm, SQLite, GNU Make, and VitePress.
Node.js 26 is pinned in `.nvmrc` so that examples and test behavior begin from a
known runtime. The project requires Node.js 26.13.0 or newer within the 26.x
line unless a later decision records a change.

## Verify the runtime

```sh
node --version
npm --version
make --version
```

The first command should report `v26.13.0` or a later compatible 26.x release.
The book itself requires Node.js 22 or newer through VitePress, but the
application curriculum uses the stricter project baseline.

## Install and build

```sh
npm install
npm run docs:build
```

`npm install` creates the root lockfile and installs the documentation toolchain.
`npm run docs:build` compiles Markdown into a static site. It is the first
repeatable verification that the book's configuration and links are coherent.

## Repository boundaries

The main Git repository tracks software and public project documentation on the
`wip` branch. `.development/` is an independent Git repository on `main`; it
tracks research, decisions, plans, and session state. The parent repository
ignores `.development/` so engineering memory cannot accidentally become a
product-history subtree.

## Package management rule

The root package owns only documentation and repository-level tooling. Each
application owns its runtime dependencies and lockfile. This keeps an
application runnable from its own directory and makes architectural differences
visible in package manifests.

