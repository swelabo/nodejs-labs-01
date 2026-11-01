# Common API conventions

All application APIs use `/api/v1` and return JSON unless an endpoint says that
it returns a redirect or plain text. Browser HTML routes are separate from API
routes.

## Resource conventions

- Collection reads use `GET /resources`.
- Individual reads use `GET /resources/{id}`.
- Creation uses `POST /resources` and returns `201 Created`.
- Replacement or partial edits use `PUT` or `PATCH` according to the resource
  specification.
- Deletion returns `204 No Content` when successful.
- Pagination uses `page` and `page_size`; implementations cap `page_size`.
- Validation failures use `400 Bad Request`.
- Missing resources use `404 Not Found`.
- Authentication failures use `401 Unauthorized`; insufficient permissions use
  `403 Forbidden`.

Where suitable, errors use RFC 9457 Problem Details with `type`, `title`,
`status`, `detail`, and an optional `errors` object. No response exposes SQL,
stack traces, credentials, or private-resource existence through an error detail.

