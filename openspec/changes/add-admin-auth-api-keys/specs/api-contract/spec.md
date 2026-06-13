## ADDED Requirements

### Requirement: OpenAPI documents admin API key authentication

The OpenAPI contract SHALL document admin API key authentication through the `X-Admin-API-Key` request header.

#### Scenario: Admin API key security scheme is documented

- **WHEN** a developer inspects the OpenAPI components
- **THEN** the contract documents an API key security scheme using the `X-Admin-API-Key` header

#### Scenario: Query parameter API keys are not documented

- **WHEN** a developer inspects the OpenAPI contract
- **THEN** the contract does not document query parameter API keys as a supported authentication mechanism

### Requirement: OpenAPI marks protected admin operations

The OpenAPI contract SHALL mark `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log` as requiring admin API key authentication.

#### Scenario: Protected operations require admin API key in OpenAPI

- **WHEN** a developer inspects the OpenAPI operations for protected administrative endpoints
- **THEN** each operation declares the admin API key security requirement

#### Scenario: Health operation remains unauthenticated in OpenAPI

- **WHEN** a developer inspects the OpenAPI operation for `GET /health`
- **THEN** the operation does not require the admin API key

### Requirement: OpenAPI documents authentication failure responses

The OpenAPI contract SHALL document HTTP 401 authentication failure responses for protected administrative endpoints using the standard error response shape.

#### Scenario: Protected operations document 401 responses

- **WHEN** a developer inspects the OpenAPI operations for protected administrative endpoints
- **THEN** each operation documents an HTTP 401 response using the standard error response schema
