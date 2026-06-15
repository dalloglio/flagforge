## Purpose

Define the source-controlled OpenAPI contract for the public FlagForge HTTP API and how contributors validate and view it.

## Requirements

### Requirement: Source-controlled OpenAPI contract

The repository SHALL include a source-controlled OpenAPI contract for the current public FlagForge HTTP API.

#### Scenario: Contract file is present

- **WHEN** a developer inspects the repository
- **THEN** the repository contains a canonical OpenAPI document under `docs/api/`

#### Scenario: Contract is not generated-only output

- **WHEN** the project is checked out from source control
- **THEN** the canonical OpenAPI document is available without running a build or generation command

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

### Requirement: OpenAPI contract documents parameters

The OpenAPI contract SHALL document public path and query parameters used by the current API.

#### Scenario: Feature flag key path parameter is documented

- **WHEN** a developer inspects operations containing `{key}`
- **THEN** the contract documents the key as a required string path parameter matching the accepted feature flag key validation pattern

#### Scenario: Audit log filter query parameter is documented

- **WHEN** a developer inspects `GET /audit-log`
- **THEN** the contract documents the optional `flagKey` query parameter and its validation-error response behavior

### Requirement: OpenAPI contract documents request schemas

The OpenAPI contract SHALL document request schemas for the current write and evaluation operations.

#### Scenario: Create flag request is documented

- **WHEN** a developer inspects `POST /flags`
- **THEN** the contract documents a request body with required `key` and `enabled` fields plus optional `description`, `rules`, and `rollout` fields

#### Scenario: Update flag request is documented

- **WHEN** a developer inspects `PATCH /flags/{key}`
- **THEN** the contract documents a request body that allows partial updates to `enabled`, `description`, `rules`, and `rollout` and does not allow changing the flag key

#### Scenario: Evaluation request is documented

- **WHEN** a developer inspects `POST /flags/{key}/evaluate`
- **THEN** the contract documents a request body containing an optional `context` object whose values are strings, numbers, or booleans

### Requirement: OpenAPI contract documents domain schemas

The OpenAPI contract SHALL document reusable schemas for public feature flag, rule, rollout, evaluation, audit event, and error payloads.

#### Scenario: Feature flag schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents a feature flag schema with `key`, `enabled`, optional `description`, `rules`, and optional `rollout`

#### Scenario: Rule schemas are documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents `equals` and `in` rule variants and does not document unsupported rule operators

#### Scenario: Context value schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents context and rule values as strings, numbers, or booleans

#### Scenario: Rollout schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents rollout `percentage` as an integer from `0` through `100` and `attribute` as a non-empty string

#### Scenario: Evaluation result schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents evaluation results containing `key`, `enabled`, and a reason from the current evaluation reason values

#### Scenario: Audit event schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents audit events containing `id`, `occurredAt`, `action`, `flagKey`, `before`, and `after`

#### Scenario: Error response schema is documented

- **WHEN** a developer inspects OpenAPI components
- **THEN** the contract documents the standard error response shape with `error.code`, `error.message`, and optional `error.details`

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

#### Scenario: Operational health operations remain unauthenticated in OpenAPI

- **WHEN** a developer inspects the OpenAPI operations for `GET /health`, `GET /healthz`, and `GET /readyz`
- **THEN** those operations do not require the admin API key

### Requirement: OpenAPI documents authentication failure responses

The OpenAPI contract SHALL document HTTP 401 authentication failure responses for protected administrative endpoints using the standard error response shape.

#### Scenario: Protected operations document 401 responses

- **WHEN** a developer inspects the OpenAPI operations for protected administrative endpoints
- **THEN** each operation documents an HTTP 401 response using the standard error response schema

### Requirement: OpenAPI contributor documentation

The repository SHALL document how contributors validate and view the OpenAPI contract.

#### Scenario: Validation instructions are documented

- **WHEN** a contributor reads the repository documentation
- **THEN** the documentation explains the command used to validate the OpenAPI contract locally

#### Scenario: Viewing instructions are documented

- **WHEN** a contributor reads the repository documentation
- **THEN** the documentation explains how to view the OpenAPI contract through a local documentation preview or equivalent viewer
