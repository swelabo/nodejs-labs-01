# JavaScript foundations for Python and Go developers

This chapter is a working map of the language topics needed by the labs. The
examples are deliberately small enough to paste into `node --input-type=module`
or a test file. JavaScript is not “Python with braces” and it is not Go with a
garbage collector: values, coercion, object identity, and asynchronous control
flow all affect the architecture of a Node application.

## Learning objectives

After this chapter, a reader should be able to explain lexical bindings,
closures, prototypes, modules, promises, error propagation, and the difference
between an object value and a class instance. They should also be able to spot
implicit coercion and choose a representation that makes a boundary explicit.

## History and execution environments

ECMAScript specifies the language. Node.js supplies a host runtime with V8,
filesystem, networking, processes, and a module loader. A browser supplies a
different host with DOM and Web APIs. The same `Array.prototype.map` belongs to
the language; `process`, `fs`, and `node:test` belong to Node.

## Bindings, scope, and values

Use `const` for a binding that will not be reassigned and `let` when reassignment
is intentional. Neither makes an object immutable.

```js
const settings = { retries: 2 }
settings.retries = 3       // allowed: the binding still points to the same object
let attempts = 0
attempts += 1
```

`var` is function-scoped and has hoisting behavior that makes boundary code
harder to reason about. Prefer block-scoped declarations. A closure retains
access to the lexical environment that created it:

```js
export function counter() {
  let value = 0
  return () => ++value
}
```

The returned function is stateful without exposing the variable. This is useful
for factories and dangerous when hidden state is expected to be shared across
requests.

## The type system

JavaScript has primitive values (`undefined`, `null`, booleans, numbers,
bigints, strings, and symbols) and object values. `number` is IEEE-754 double
precision, so integer safety ends at `Number.MAX_SAFE_INTEGER`; use `bigint` for
larger integer arithmetic and never mix it with `number` implicitly.

Prefer strict equality (`===`). The loose equality algorithm performs coercion:
`'' == 0` is true while `'' === 0` is false. Truthiness is also coercive, so
validate request fields by type and shape rather than writing `if (!value)` when
zero or an empty string may be valid.

```js
export function parseLimit(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new TypeError('limit must be digits')
  const limit = Number(value)
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new RangeError('limit out of range')
  return limit
}
```

## Objects, prototypes, and classes

Objects are mutable property maps with a prototype chain. Property lookup walks
that chain; it is not the same as a Go struct field access. Use
`Object.hasOwn(object, key)` when processing untrusted keys. A class is syntax
for constructor and prototype methods, not a separate nominal runtime type
system.

```js
class Slug {
  constructor(value) { this.value = value }
  toString() { return this.value }
}
```

For domain values, make invalid construction impossible or throw at the factory
boundary. For plain transport data, use object literals and explicit mapping.
Do not leak ORM objects into an API response merely because their shape happens
to look convenient.

## Arrays and collections

`map`, `filter`, `find`, and `reduce` create a readable transformation pipeline,
but each has a cost. Use `for...of` when early exit, `await`, or clearer control
flow matters. `Map` and `Set` express keyed lookup and uniqueness; plain objects
are not a safe substitute for a map when keys come from users.

```js
const uniqueTags = [...new Set(inputTags.map((tag) => tag.trim()).filter(Boolean))]
```

## Functions, closures, and functional style

Functions are values. Arrow functions capture lexical `this`; regular methods
can receive a dynamic receiver. Passing a method as a callback can therefore
lose its receiver unless it is bound or written as a closure. Small pure
functions make validation and use-case tests cheap, but a purely functional
style is not a requirement for Node.

## Classes and object-oriented design

Use classes when identity, invariants, or lifecycle behavior are central. Use
functions and modules when a stateless transformation is clearer. In the DDD
variant, a `Post` aggregate owns publication invariants; in the direct variant,
the repository makes the same rule visible in SQL. The architecture is more
important than whether the syntax says `class`.

## Modules and package boundaries

ES modules have static `import`/`export` declarations and live bindings.
CommonJS uses `require` and `module.exports`; interop has edge cases around
default exports. The repository uses ESM consistently, with `.js` files
interpreted by the root `type` field. Keep HTTP, application, domain, and
infrastructure imports directional so a domain module cannot accidentally load
Express or Prisma.

## Errors and error handling

Throw errors for exceptional control flow inside a synchronous operation. An
`async` function turns a thrown error into a rejected promise, so every caller
must either `await` it in a `try` block or return the promise to a handler that
maps it to an HTTP response. Preserve error identity and use typed error classes
or stable error codes at boundaries.

```js
try {
  const post = await service.publish(command)
  return response.json({ data: post })
} catch (error) {
  return next(error)
}
```

Do not return stack traces or database messages to clients. Log the cause with a
request identifier and return a stable problem response.

## Promises and async/await

Promises represent eventual completion, not a background thread. `await` pauses
the current async function and gives the event loop a chance to run other work.
Use `Promise.all` only for independent operations; sequential awaits are correct
when the second operation depends on the first or when a transaction requires
ordering. Never start an unawaited promise in a request handler without a clear
ownership and shutdown policy.

## The event loop and memory

Node can serve many requests while I/O is pending, but JavaScript callbacks run
on the event-loop thread. Large synchronous JSON parsing, regular expressions,
or loops delay every request. V8 garbage collection reclaims unreachable
objects; it does not repair unbounded caches or retained closures. Measure heap
growth and event-loop delay before choosing worker threads or a queue.

## Surprising behaviors and debugging

Common hazards include `typeof null === 'object'`, `NaN !== NaN`, mutable default
objects, accidental string concatenation, and closures retaining large values.
Use `node --test`, `node --inspect`, structured logs, and small reproduction
programs. Compare actual runtime values with `console.dir(value, { depth: null })`
rather than inferring from TypeScript declarations.

## Python and Go comparisons

Python and JavaScript both use dynamic values, but JavaScript's coercion and
prototype lookup are different. Go makes integer widths, error returns, and
package imports explicit; JavaScript moves some of those decisions to runtime.
TypeScript can catch many shape errors, but it does not validate JSON received
over HTTP. Runtime validation remains part of the application boundary.

## Exercises and review

1. Change a lab query to accept `page_size=0` and write a test proving the
   boundary rejects it rather than relying on truthiness.
2. Write a closure that leaks a large array, then remove the retention path.
3. Convert one callback-style operation to a promise and document who owns its
   failure.
4. Explain why `Promise.all` inside a database transaction can be incorrect for
   a driver that serializes one connection.

Further reading: the [ECMAScript specification](https://tc39.es/ecma262/),
[Node.js ECMAScript modules](https://nodejs.org/api/esm.html), and the
[Node.js test runner](https://nodejs.org/api/test.html).
