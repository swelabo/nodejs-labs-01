# Concurrency and worker threads

Node.js multiplexes asynchronous I/O on an event loop, but JavaScript executed
on the main thread is still synchronous. A large loop, expensive regular
expression, or synchronous password operation delays unrelated requests. The
fact that a function returns a Promise does not make CPU work parallel.

Worker threads can move CPU-heavy JavaScript to another thread, while child
processes provide stronger isolation and a separate memory space. Both add
serialization, lifecycle, observability, and failure costs. The labs keep the
request path explicit and bound input instead of introducing workers without a
measured workload.

## Exercise

Measure a bounded synchronous loop with `performance.now()`, then compare a
worker-thread version. Record latency and startup overhead rather than claiming
that concurrency is automatically faster.
