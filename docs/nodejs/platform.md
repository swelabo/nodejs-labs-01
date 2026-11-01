# Node.js platform and operations

Node.js is a host for JavaScript applications, not a web framework. The labs use
its standard library directly at several boundaries so that Express and Prisma
remain understandable choices rather than invisible foundations.

## Runtime architecture

V8 executes JavaScript and manages its heap. Node embeds the event loop and
libuv-backed I/O integrations, then exposes modules such as `http`, `fs`,
`crypto`, and `worker_threads`. A request can await a socket or database call
without occupying a JavaScript thread, but callback execution is still
serialized on the event-loop thread.

## HTTP and process boundaries

The smallest server is explicit:

```js
import { createServer } from 'node:http'
const server = createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
  response.end('ok\n')
})
server.listen(Number(process.env.PORT ?? 3000))
```

Production code must validate methods, paths, headers, and body size. Express
helps compose those concerns but does not decide authorization or data policy.
`process.argv`, `process.env`, exit codes, and signals are operating-system
interfaces. Treat all environment values as strings until parsed and validated.

## Package manifests and lockfiles

`package.json` declares scripts, module mode, engines, and dependencies.
`package-lock.json` records the resolved graph so a clean checkout can reproduce
installation. `npm ci` is appropriate for CI because it refuses a manifest and
lockfile mismatch. Each lab has its own manifest and lockfile so it remains
runnable from its directory.

## ESM and CommonJS

The labs use ESM. Relative imports include their file extension, and top-level
`await` is available in modules. A CommonJS dependency can usually be imported,
but named-export detection is imperfect; check package documentation before
assuming interop. Mixing module systems at every layer makes debugging harder,
so keep the application convention consistent.

## Files, buffers, and streams

`fs/promises` is convenient for bounded files. Streams are the correct model for
large inputs because they apply backpressure instead of loading everything into
memory. A `Buffer` is bytes, not text; decode with an explicit encoding.

```js
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
await pipeline(createReadStream('input.txt'), process.stdout)
```

Uploads need size limits, content-type checks, safe generated names, and a
storage policy. A filename supplied by a client must never become an unchecked
filesystem path.

## Concurrency and worker threads

Async I/O improves overlap for network and database waits. It does not make
CPU-heavy JavaScript parallel. Worker threads can isolate CPU work, but they add
serialization and lifecycle complexity. A queue or separate service may be a
better operational boundary for durable work. The concurrency chapter contains
an experiment that measures event-loop delay rather than assuming scalability.

## Signals and graceful shutdown

Shutdown is a protocol: stop accepting new connections, allow in-flight work to
finish within a deadline, close database clients, and exit with a meaningful
status. The lab servers install `SIGINT`/`SIGTERM` handlers and keep shutdown
idempotent. A process that ignores signals is difficult to operate in a
container or CI runner.

## Testing and debugging

The built-in `node:test` runner supports subtests, mocks, and watch mode without
requiring a framework. `supertest` exercises HTTP boundaries in-process. Use
`--test-reporter`, `--inspect`, heap snapshots, and event-loop measurements when
diagnosing behavior. A green unit test does not prove a clean installation,
contract match, or graceful startup; the repository gates those separately.

## Security baseline

Limit request bodies, parameterize SQL, escape HTML, avoid secret logging, set
appropriate cookie flags, and make authorization explicit. Node's `crypto`
module supplies secure randomness and password primitives, but choosing a
primitive is not the same as designing an authentication system. Keep secrets in
the environment or an external secret manager, never in `.development/`.

## Python and Go comparisons

Node's event loop resembles an explicit asynchronous runtime more than a Go
goroutine-per-request mental model. Python's async code has similar cooperative
execution constraints, but library and scheduling details differ. Go's compiler
and standard library make many operational contracts visible at compile time;
Node projects need disciplined scripts, tests, and runtime validation to provide
equivalent feedback.

## Exercises

1. Add a body-size limit to a raw `http` server and test the rejected request.
2. Send `SIGTERM` while a delayed request is active and record the shutdown
   ordering.
3. Replace a whole-file read with a stream and measure peak memory on a large
   fixture.
4. Run the dependency audit from a clean lockfile installation.

Official references: [Node.js API documentation](https://nodejs.org/api/),
[HTTP](https://nodejs.org/api/http.html), [streams](https://nodejs.org/api/stream.html),
[worker threads](https://nodejs.org/api/worker_threads.html), and
[process signals](https://nodejs.org/api/process.html#signal-events).
