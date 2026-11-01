# Modules and package boundaries

The repository uses ECMAScript modules. A file is a module when the package
declares `"type": "module"`; `import` and `export` then describe a static
dependency graph. This differs from Python's import-time module execution and
from Go's package-level compilation: JavaScript can still load modules
asynchronously, and the `.js` extension in TypeScript source is intentional for
NodeNext resolution.

```js
// src/ports.ts
export interface LinkPort { resolve(alias: string, referrer: string | null): Promise<string> }
// src/usecases.ts
import type { LinkPort } from './ports.js'
```

`import type` disappears at runtime. A normal import is appropriate when the
module exports a value, such as the DDD `Post` aggregate. Keeping infrastructure
imports out of `src/domain` makes the dependency rule visible in code review and
testable with a small architectural test.

Run `npm run typecheck` in a TypeScript variant to see the compiler validate the
same boundary that JavaScript tests exercise only at runtime.
