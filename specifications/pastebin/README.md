# Pastebin specification

## Essential behavior

The service stores text snippets with an owner, visibility, optional expiration,
language tag, and user-defined tags. A snippet can be public, unlisted, or
private. Public snippets are discoverable; unlisted snippets are retrievable by
permalink but are not listed; private snippets require authorization.

Snippet content is untrusted text. Syntax highlighting may transform text for
display, but it must not turn user input into executable HTML. Raw views return
plain text with a safe content type.

## API surface

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/snippets` | Create a snippet |
| `GET` | `/api/v1/snippets` | List discoverable snippets with search and pagination |
| `GET` | `/api/v1/snippets/{id}` | Read a permitted snippet |
| `GET` | `/api/v1/snippets/{id}/raw` | Read permitted content as plain text |
| `PATCH` | `/api/v1/snippets/{id}` | Edit an owned snippet |
| `DELETE` | `/api/v1/snippets/{id}` | Delete an owned snippet |

The service must not reveal whether a private identifier exists to an
unauthorized caller. Expired snippets behave as unavailable resources.

## Required tests

- visibility rules are enforced for list, HTML, and raw views;
- unauthorized private access does not disclose existence;
- content is escaped in HTML output;
- raw output is plain text;
- payload size is limited before persistence;
- owner-only edits and deletes are enforced;
- expired snippets are not returned;
- search and pagination have bounded inputs.

