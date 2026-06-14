## MODIFIED Requirements

### Requirement: OpenAPI contract covers public endpoints

The OpenAPI contract SHALL document the current public FlagForge HTTP endpoints without adding, removing, or changing endpoint behavior. Operational metrics at `GET /metrics` SHALL remain documented in operational documentation rather than the public OpenAPI contract.

#### Scenario: Health endpoint is documented

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract documents `GET /health` with an HTTP 200 response containing `status` equal to `ok`

#### Scenario: Liveness endpoint is documented

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract documents `GET /healthz` with an HTTP 200 response containing `status` equal to `ok`

#### Scenario: Readiness endpoint is documented

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract documents `GET /readyz` with an HTTP 200 ready response and an HTTP 503 not-ready response

#### Scenario: Metrics endpoint is omitted from public OpenAPI contract

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract does not document `GET /metrics`

#### Scenario: Flag management endpoints are documented

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract documents `POST /flags`, `GET /flags`, `GET /flags/{key}`, and `PATCH /flags/{key}`

#### Scenario: Evaluation endpoint is documented

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract documents `POST /flags/{key}/evaluate`

#### Scenario: Audit log endpoint is documented

- **WHEN** a developer inspects the OpenAPI paths
- **THEN** the contract documents `GET /audit-log`

### Requirement: OpenAPI contract documents status codes

The OpenAPI contract SHALL document known successful, client error, and operational dependency status codes for the current API.

#### Scenario: Successful responses are documented

- **WHEN** a developer inspects operation responses
- **THEN** the contract documents current successful HTTP status codes, including 200 and 201 where applicable

#### Scenario: Readiness dependency failure is documented

- **WHEN** a developer inspects `GET /readyz`
- **THEN** the contract documents an HTTP 503 response for not-ready dependency state

#### Scenario: Validation errors are documented

- **WHEN** a developer inspects operation responses for endpoints that validate path parameters, query parameters, or request bodies
- **THEN** the contract documents HTTP 400 validation-error responses

#### Scenario: Malformed JSON errors are documented

- **WHEN** a developer inspects operation responses for endpoints that accept JSON request bodies
- **THEN** the contract documents HTTP 400 malformed JSON responses using the standard error response shape

#### Scenario: Conflict errors are documented

- **WHEN** a developer inspects `POST /flags`
- **THEN** the contract documents the HTTP 409 duplicate-key conflict response

#### Scenario: Not-found errors are documented

- **WHEN** a developer inspects operations that address a specific feature flag
- **THEN** the contract documents HTTP 404 not-found responses for missing feature flags

## ADDED Requirements

### Requirement: OpenAPI contract documents operational health schemas

The OpenAPI contract SHALL document reusable response schemas for public operational health endpoints.

#### Scenario: Liveness response schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents a liveness response schema containing `status` equal to `ok`

#### Scenario: Readiness response schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents a readiness response schema with top-level `status` equal to `ready` or `not_ready`
- **AND** the schema documents `dependencies.postgresql.status` equal to `available` or `unavailable`
- **AND** the schema does not include connection strings, credentials, stack traces, SQL driver messages, or secret values
