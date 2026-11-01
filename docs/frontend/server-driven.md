# Server-driven frontend without a SPA

The application frontends use server-rendered HTML and progressive enhancement.
EJS produces the initial document; HTMX can replace a small fragment after a
request; Alpine.js handles local interaction; Tailwind supplies utility styles.
None changes the security model: escaped output, CSRF/session care,
authorization, and safe content types remain server responsibilities.

All eighteen applications install these browser dependencies locally.
`npm run frontend:build` copies pinned HTMX and Alpine.js distributions into
`src/public/vendor/` and compiles `src/public/input.css` with Tailwind. Their
`prestart` hook makes a clean install reproducible without a CDN dependency;
the generated assets are deliberately treated as application build output.

## Learning objectives

You should be able to choose between a full document response and a fragment,
design a form that works without JavaScript, preserve URL/history semantics, and
explain the accessibility and security tradeoffs of server-driven interaction.

## Progressive enhancement

Start with a complete HTML response. Add JavaScript only when it improves an
interaction that still has a meaningful server fallback. A create form should
submit normally before it gains an HTMX enhancement; a navigation link should
remain a link rather than becoming an opaque click handler.

```html
<form method="post" action="/admin/pages">
  <label for="title">Title</label>
  <input id="title" name="title" required>
  <button type="submit">Save draft</button>
</form>
```

The browser's native validation is useful feedback, not authorization. The
server repeats type, length, ownership, and state validation.

## Fragments and navigation

HTMX can request a server fragment and swap it into a target element. Define
which response shape is expected and make the endpoint safe for a direct request.
If a fragment is not a complete document, its route should not accidentally
become a public API with different authorization semantics.

```html
<button hx-get="/admin/posts?fragment=table"
        hx-target="#post-table"
        hx-swap="outerHTML">
  Refresh posts
</button>
<section id="post-table" aria-live="polite"><!-- server fragment --></section>
```

After a mutation, redirect to a canonical GET (PRG) so refresh does not repeat
the write. Preserve filters and pagination in query parameters so the URL is a
bookmarkable representation of state. Use the browser history deliberately when
fragment navigation changes what a user considers a page.

## Local state and Alpine.js

Alpine is suitable for small local state such as opening a disclosure or showing
a password. It is not a replacement for authorization or server truth. Do not
put secrets, permission decisions, or untrusted HTML in client state merely
because it is convenient to bind.

## Escaping and content types

EJS `<%= value %>` escapes interpolation; `<%- value %>` emits raw markup and is
an explicit trust boundary. User post bodies in the Blog are rendered as text.
If a future Markdown renderer is introduced, sanitize the resulting HTML with a
documented allowlist and test event-handler payloads. Plain snippets use a text
content type so browsers do not interpret their contents as markup.

## Accessibility

Use real headings, labels, buttons, links, focus order, visible focus styles, and
keyboard-operable controls. Announce asynchronous updates with an appropriate
live region without moving focus unexpectedly. A spinner is not an accessible
status by itself. Test the no-JavaScript path, keyboard navigation, zoom, and
screen-reader names before relying on a client enhancement.

## Security model

HTML forms with cookies need CSRF protection on state-changing requests. A
fragment request still needs authentication and authorization; hiding a button
does not enforce permission. Validate redirect targets, escape user-controlled
attributes, set cookie flags, and keep sensitive values out of HTML and browser
storage. CSP, secure transport, and deployment headers remain operational
responsibilities.

## Performance and caching

Server rendering can send useful content before a large client bundle loads. It
also increases server work per navigation and may need fragment caching. Cache
only responses whose authorization and variation keys are understood. Never
share a private fragment through a public cache. Measure document size, server
render time, database queries, and interaction latency rather than assuming a
SPA or a server-rendered page is faster.

## Python and Go comparisons

This approach resembles server-rendered Django/Jinja or Go `html/template`
applications with optional browser enhancements. The platform difference is in
the JavaScript runtime and ecosystem, not in the HTML security rules. A browser
does not know whether a response came from Express, Flask, or `net/http`; it
still needs correct semantics and safe output.

## Exercises

1. Make an admin form work with JavaScript disabled, then add a fragment update.
2. Test that the same mutation rejects a missing CSRF token through both paths.
3. Add an accessible live status for a comment moderation result.
4. Explain why a private fragment must vary by identity or avoid shared caching.

References: [HTMX attributes](https://htmx.org/reference/),
[Alpine.js directives](https://alpinejs.dev/directives),
[HTML forms](https://html.spec.whatwg.org/multipage/forms.html), and the
[WCAG quick reference](https://www.w3.org/WAI/standards-guidelines/wcag/).
