# Node.js runtime fundamentals

Node.js is a JavaScript runtime built around V8 and an event-driven I/O model.
It is not a web framework and it is not a language. Express, SQLite drivers,
template engines, and test libraries are userland components running inside the
runtime.

## A request is an asynchronous composition

An HTTP request typically crosses several asynchronous boundaries: socket input,
request parsing, database access, template rendering, and socket output. The
handler can read like sequential code when it uses `await`, but the runtime can
serve other requests while an awaited I/O operation is pending.

```js
import { createServer } from 'node:http'

const server = createServer(async (_request, response) => {
  await new Promise((resolve) => setTimeout(resolve, 10))
  response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
  response.end('ok\n')
})

server.listen(3000)
```

The delay is asynchronous. Replacing it with a CPU-heavy loop would keep the
JavaScript thread occupied and delay unrelated callbacks. The curriculum will
measure this distinction with a controlled experiment rather than treating
"non-blocking" as a blanket performance guarantee.

## Core modules are explicit dependencies

Node's standard library is imported with the `node:` prefix:

```js
import { readFile } from 'node:fs/promises'
import process from 'node:process'
```

The prefix makes it clear that the import is provided by the runtime rather than
resolved from `node_modules`. It also makes dependency review easier when a file
mixes platform facilities and third-party packages.

## Errors cross boundaries

Node APIs commonly report failures by rejecting promises or passing errors to
callbacks. Application code must decide where to translate those failures into
HTTP responses, retries, logs, or process termination. A route should not expose
raw database errors to a browser, and a startup failure should not be silently
converted into a server that appears healthy.

The later architecture variants move these translations into explicit adapters
and policies. The simple variant keeps them close to the request path so the
tradeoff is visible.

## Runtime configuration

Configuration enters through environment variables and command-line arguments,
not hard-coded secrets. A startup boundary should parse and validate values once,
then pass a typed or normalized configuration object to the application. This
prevents every route from inventing its own interpretation of `PORT`, database
paths, or feature flags.

