# Use-case-driven comparison

`usecases-01/url-shortener` separates application operations from HTTP delivery.
The route knows how to read headers and format status codes; `createLink`,
`updateLink`, `deleteLink`, `listLinks`, and `resolveLink` describe workflows
independently of Express.

The boundary improves reuse and makes transport-independent tests possible. It
also adds indirection and can become ceremony when an application has only one
transport and simple CRUD behavior. The delegation test demonstrates the
boundary without claiming that the pattern is universally necessary.

