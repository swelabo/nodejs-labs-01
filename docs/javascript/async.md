# Promises, async functions, and the event loop

An `async` function returns a Promise even when its body returns a plain value.
`await` suspends that function until the Promise settles; it does not block the
Node.js thread while the database or filesystem operation is pending. The
request handler can therefore express a sequential workflow without turning
I/O into a busy wait.

```js
app.get('/:alias', async (request, response, next) => {
  try {
    const destination = await useCases.resolveLink(request.params.alias, null)
    response.redirect(302, destination)
  } catch (error) {
    next(error)
  }
})
```

The `try/catch` is not optional: a rejected Promise that is not forwarded to
Express's error middleware can become an unhandled rejection or a response that
never completes. CPU-heavy synchronous work is different. It occupies the
event-loop thread and delays every request, so hashing, parsing, and large
transformations need bounded inputs or worker/process isolation.
