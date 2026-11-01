# Express security boundaries

Express does not authenticate a request merely because it has a route. The
application must establish identity, authorize the requested operation, and
validate every untrusted field. Middleware order matters: body parsing occurs
before handlers read `request.body`, and error middleware must be registered
after routes.

The direct Blog demonstrates the complete teaching boundary: password KDF,
opaque server sessions, HttpOnly/SameSite cookies, a double-submit CSRF token,
role checks, bounded bodies, escaped templates, and safe problem responses.
Later architectural variants keep the behavior tests but focus on persistence
and dependency direction rather than duplicating the full account subsystem.

Never use the development `X-User-Id` header as production authentication. It is
an explicit test seam whose limitation is documented in the README.
