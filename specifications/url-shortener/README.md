# URL shortener specification

## Essential behavior

The service creates a short link that resolves to a validated absolute HTTP or
HTTPS URL. An alias is unique within the service. A link may have an expiration
instant and an active flag. An inactive or expired link does not redirect.

Creation supports generated aliases and, when the caller requests one, custom
aliases. Anonymous creation is disabled by default and is a configuration
choice, not an authorization bypass for management operations.

## API surface

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/links` | Create a link |
| `GET` | `/api/v1/links` | List links visible to the caller with search and pagination |
| `GET` | `/api/v1/links/{alias}` | Read link metadata visible to the caller |
| `PATCH` | `/api/v1/links/{alias}` | Change active state or expiration |
| `DELETE` | `/api/v1/links/{alias}` | Delete an owned link |
| `GET` | `/api/v1/links/{alias}/analytics` | Read aggregate click analytics |
| `GET` | `/{alias}` | Resolve a public active link with a redirect |

The redirect target is never accepted from a request during resolution. It is
loaded from the stored link after checking active state and expiration.

## Data and privacy

Each click records a timestamp and optional coarse referrer information. The
service must avoid storing raw IP addresses by default. Analytics are aggregate
and do not become a second identity system.

## Required tests

- generated aliases resolve;
- a duplicate custom alias is rejected;
- malformed schemes are rejected;
- inactive and expired links do not redirect;
- unauthorized management access is rejected;
- pagination and search are bounded;
- redirect status and `Location` are correct;
- analytics do not expose raw personal data.

