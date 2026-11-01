# Security baseline

The applications treat security as a boundary property:

- destinations accept only absolute HTTP(S) URLs;
- SQL uses parameters or Prisma's parameterized client;
- private snippets do not reveal existence to unauthorized callers;
- ownership and editor/administrator roles are enforced server-side;
- HTML output is escaped, while raw snippets use a plain-text content type;
- JSON bodies and list sizes are bounded;
- session cookies are HttpOnly and password material uses a password KDF;
- the direct Blog's authenticated mutations require a double-submit CSRF token;
- generated secrets and local credentials stay out of Git.

These controls are deliberately educational rather than a production security
certification. Rate limiting is local in the introductory URL shortener,
CAPTCHA is a one-time self-hosted challenge, and SQLite has single-process
operational assumptions. A production deployment needs threat modeling,
centralized abuse controls, secret rotation, dependency scanning, audit logging,
and recovery testing.
