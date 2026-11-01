# Server-driven frontend

The simple applications use server-rendered HTML and progressive enhancement.
EJS produces the initial document; HTMX can replace a small fragment after a
request; Alpine.js handles local interaction; Tailwind supplies utility styles.
None of these tools changes the security model: escaped output, CSRF/session
care, authorization, and safe content types remain server responsibilities.

This approach is a useful baseline for a student coming from backend systems.
The browser receives useful HTML before optional JavaScript loads, while a SPA
would move routing, state, and API coordination into a larger client runtime.
The curriculum records that tradeoff and leaves React, Vue, Vite, and Next.js
as future extensions rather than mixing them into the architecture experiment.
