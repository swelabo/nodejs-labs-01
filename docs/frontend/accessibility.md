# Progressive enhancement and accessibility

Server-rendered HTML gives the browser a meaningful document before optional
JavaScript runs. Forms need labels, keyboard-accessible controls, useful error
messages, and semantic headings; HTMX requests should preserve an equivalent
non-JavaScript path where practical. Alpine.js can improve local interaction,
but it should not be the only way to discover or submit important content.

Escaping is separate from accessibility. A visually polished snippet page can
still be an XSS vulnerability if untrusted text is inserted as HTML. The
Pastebin browser tests verify escaped output and the raw endpoint uses plain
text.
