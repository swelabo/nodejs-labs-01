# Express web development

Express is a small HTTP composition layer. It does not provide a domain model,
authentication policy, persistence strategy, or a security review. The direct
Blog makes this visible by keeping handlers and SQLite queries close together;
the later variants move the same decisions behind use cases and ports.

## Learning objectives

You should be able to trace a request through middleware and a route, distinguish
transport validation from domain validation, design a resource-oriented API,
map errors to stable responses, and explain where authentication ends and
authorization begins.

## The request pipeline

Express executes middleware in registration order. A middleware must either end
the response, call `next()`, or call `next(error)`. Forgetting all three leaves
the request hanging. Error middleware has four parameters and must be registered
after routes.

```js
const app = express()
app.use(express.json({ limit: '256kb' }))
app.use((request, response, next) => {
  request.startedAt = Date.now()
  next()
})
app.get('/health', (_request, response) => response.json({ ok: true }))
app.use((error, _request, response, _next) => {
  response.status(error.statusCode ?? 500).json({ type: 'about:blank', title: 'Request failed' })
})
```

The body limit is a security boundary. It prevents a client from turning a
small endpoint into an unbounded memory allocation. Set it deliberately per
content type when uploads and JSON have different needs.

## Routes and resource design

Use nouns for resources and HTTP methods for intent: `GET /posts`,
`GET /posts/:slug`, `POST /posts`, and `PATCH /posts/:id`. A slug is a public
identifier; an internal integer ID is not automatically a safe public URL. Use
consistent status codes and content types, and make not-found behavior
indistinguishable for private resources when revealing existence would be a
security problem.

Express route parameters are strings. Parse and validate them before using them
as numbers or SQL values. Query strings are untrusted and may be repeated or
unexpectedly large. Bound search terms, page sizes, and sort choices with an
allowlist.

## Validation at two boundaries

Transport validation answers “is this request shaped correctly?” Domain
validation answers “is this operation allowed by the model?” They are related
but not interchangeable. A JSON body can have a valid string and still violate
ownership, publication, uniqueness, or a state transition rule.

```js
function requireSlug(value) {
  if (typeof value !== 'string' || !/^[a-z0-9-]{1,128}$/.test(value)) {
    const error = new Error('slug is invalid')
    error.statusCode = 400
    throw error
  }
  return value
}
```

Do not trust a TypeScript interface or an OpenAPI document to validate runtime
JSON. The direct labs perform runtime checks; the TypeScript labs add static
contracts for code that has already crossed the boundary.

## Authentication and authorization

Authentication identifies a principal. Authorization decides whether that
principal may perform a particular action on a particular resource. A session
cookie can identify an editor, but it does not make every editor an
administrator. Check ownership and role at the operation boundary, not only in
the browser or a route name.

For cookie sessions, use `HttpOnly`, `Secure` in HTTPS deployments, an explicit
`SameSite` policy, expiration, rotation, and server-side revocation. State
changing browser requests need CSRF protection. The direct Blog demonstrates a
double-submit token; its development header remains a teaching seam rather than
an authentication mechanism.

## Error mapping

An application error should be mapped once at the HTTP boundary. Return a stable
problem shape with a useful status and safe detail. Do not return SQL syntax,
stack traces, password hashes, or filesystem paths. Log the cause with context
on the server, and preserve the original error when wrapping it.

| Situation | HTTP result | Boundary concern |
| --- | --- | --- |
| malformed JSON/body too large | 400/413 | reject before domain work |
| invalid field or state transition | 400 | explain field-level error safely |
| missing identity | 401 | do not invent a user |
| insufficient permission | 403 or deliberate 404 | avoid authorization bypass and existence leaks |
| missing public resource | 404 | apply the publication predicate |
| unexpected failure | 500 | log detail, return generic response |

## REST contracts and OpenAPI

OpenAPI is an executable review artifact in this repository. Each application
has a local contract and the root verifier checks required paths. The document
should describe request schemas, authentication schemes, status codes, error
content, pagination, and public/private visibility. A path marker alone is not
enough evidence of behavior; the corresponding test must exercise the route.

## Server-rendered HTML

EJS interpolation escapes by default when written as `<%= value %>`. Treat
`<%- value %>` as an explicit trust decision. The Blog renders user-submitted
bodies as text, not HTML, and tests an XSS payload. Escaping output is necessary
but does not replace input validation, CSP, cookie policy, or safe URL handling.

## Testing handlers

Use a small app factory so tests can inject an in-memory database or a fake port.
Test the HTTP status, response shape, persistence effect, and security boundary.
Use separate tests for middleware order, error mapping, ownership, publication
timing, and oversized bodies. A test that only checks a 200 response does not
prove authorization or data isolation.

## Performance and operations

Keep handlers short enough to reveal the workflow, but do not hide expensive
work in middleware. Avoid synchronous CPU or filesystem calls on hot request
paths. Use pagination and database indexes; do not load every post merely to
return the first page. Install shutdown handlers that stop accepting work and
close the database client.

## Python and Go comparisons

Express middleware resembles a manually composed chain of Python WSGI/ASGI
middleware, but `next()` order and error middleware are runtime conventions. It
also resembles Go's `http.Handler` wrapping, while omitting compile-time
guarantees about request context and response shape. The explicit app factory
and boundary tests supply the feedback that a statically typed handler signature
would otherwise provide.

## Exercises

1. Add an allowlisted `sort` query parameter and test an unknown value.
2. Add a route that distinguishes authentication from ownership.
3. Make a private resource return the same result for an unknown and an
   unauthorized slug; explain the information leak prevented.
4. Add a response test that proves a draft is absent from both HTML and JSON.

References: [Express routing](https://expressjs.com/en/guide/routing.html),
[Express middleware](https://expressjs.com/en/guide/using-middleware.html),
[Express error handling](https://expressjs.com/en/guide/error-handling.html),
and [OpenAPI](https://spec.openapis.org/oas/latest.html).
