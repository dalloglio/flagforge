## ADDED Requirements

### Requirement: OpenAPI documents admin rate-limit responses

The OpenAPI contract SHALL document HTTP 429 rate-limit responses for `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log` using the standard error response shape.

#### Scenario: Protected operations document 429 responses

- **WHEN** a developer inspects the OpenAPI operations for protected administrative endpoints
- **THEN** each protected administrative operation documents an HTTP 429 response using the standard error response schema

#### Scenario: Rate-limit recovery header is documented

- **WHEN** a developer inspects the OpenAPI contract for protected administrative endpoint rate-limit responses
- **THEN** the contract documents the `Retry-After` response header when retry timing is available

#### Scenario: Operational health operations do not document admin rate limits

- **WHEN** a developer inspects the OpenAPI operations for `GET /health`, `GET /healthz`, and `GET /readyz`
- **THEN** those operations do not document admin rate-limit responses
