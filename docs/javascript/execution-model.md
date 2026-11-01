# JavaScript execution model

JavaScript looks familiar to a Python or Go developer at the syntax level, but
its execution model has different boundaries. The most important distinction for
Node.js work is that JavaScript code runs to completion on an event-loop thread,
while asynchronous operations allow the runtime to arrange later callbacks or
promise continuations.

## Values and bindings

`const` creates a binding that cannot be reassigned; it does not make an object
immutable. `let` creates a reassignable block-scoped binding. Prefer `const` for
references whose identity does not change and use `let` when reassignment is part
of the algorithm. `var` has function scope and legacy hoisting behavior; the
curriculum avoids it so scope remains visible in examples.

```js
const settings = { port: 3000 }
settings.port = 3001       // the object changes
// settings = {}           // would fail: the binding is constant
```

This differs from Go's distinction between a value and a pointer less directly
than it differs from Python's naming model. JavaScript variables hold references
to objects, and equality is usually identity-based for objects. Use explicit
value comparisons or domain methods when identity is not the intended meaning.

## Functions close over lexical state

A function can retain access to bindings from the scope where it was created.
That closure is useful for request handlers, factories, and test fixtures, but it
also means a function can keep data alive longer than its caller appears to.

```js
export function makeCounter() {
  let count = 0
  return () => ++count
}
```

The returned function is not a method on a class. It is a value carrying behavior
and access to `count`. Later chapters use this mechanism before introducing
classes or dependency containers.

## Promises and `async` functions

A promise represents a future result or failure. An `async` function always
returns a promise, and `await` pauses that function until the awaited promise
settles. It does not block the Node.js event loop while the underlying I/O is in
progress.

```js
export async function readText(path) {
  const file = await import('node:fs/promises')
  return file.readFile(path, 'utf8')
}
```

Errors become rejected promises. A caller must therefore `await` the operation
inside a `try`/`catch`, return the promise to a framework that handles it, or
otherwise attach an explicit rejection path. An unobserved rejection is a
correctness problem, not a logging detail.

## Modules are part of the design

This repository uses ECMAScript modules. `import` and `export` describe static
module relationships, while `package.json` with `"type": "module"` tells Node.js
how to interpret `.js` files. Relative imports include their file extension in
Node.js application code. A module is evaluated once per process and its exports
are shared by importers, so module-level mutable state is process-global.

