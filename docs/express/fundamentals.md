# Express fundamentals

Express is a function pipeline. A route handler receives a request, response,
and usually `next`; middleware either completes the response or calls `next`.
Error middleware is distinguished by four parameters and should translate
known domain or validation errors into stable problem responses.

The application variants keep route handlers thin. They parse transport data,
identify the caller, invoke a use case, and translate the result. They do not
own publication rules, ownership policy, or SQL. This separation is useful even
before a formal hexagonal architecture because it gives behavior tests a stable
application seam.

Disable unnecessary framework disclosures, bound JSON bodies, validate URLs and
identifiers, and never send untrusted snippet content as HTML. These are
application responsibilities, not automatic consequences of using Express.
