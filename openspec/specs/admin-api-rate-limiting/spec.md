## Purpose

Define how FlagForge configures and enforces local rate limiting for protected administrative endpoints.

## Requirements

### Requirement: Protected admin requests are rate limited

The system SHALL enforce a configurable rate limit for authenticated requests to protected administrative endpoints: `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.

#### Scenario: Request below the limit proceeds normally

- **WHEN** an authenticated admin request is sent to a protected administrative endpoint and the authenticated identity has not exceeded the configured rate limit
- **THEN** the system allows the request to proceed to normal endpoint validation and handling

#### Scenario: Request above the limit is rejected

- **WHEN** an authenticated admin request is sent to a protected administrative endpoint and the authenticated identity has exceeded the configured rate limit
- **THEN** the system responds with HTTP 429
- **AND** the administrative operation is not performed

### Requirement: Local default rate-limit policy

The system SHALL provide a documented non-secret local default rate limit of 60 protected admin requests per minute per authenticated admin identity.

#### Scenario: Default policy is applied

- **WHEN** the application starts without an explicit admin rate-limit override
- **THEN** the system applies a limit of 60 protected admin requests per minute per authenticated admin identity

#### Scenario: Limit is configurable

- **WHEN** the application starts with a valid admin rate-limit override
- **THEN** the system applies the configured limit to protected admin requests

### Requirement: Rate-limit identity association

The system SHALL associate admin rate-limit accounting with the authenticated admin identity and SHALL NOT expose raw API key values in rate-limit responses.

#### Scenario: Authenticated identity is counted

- **WHEN** multiple protected admin requests are accepted for the same authenticated admin identity during one rate-limit window
- **THEN** the system counts those requests against the same rate-limit budget

#### Scenario: Secret values are not exposed

- **WHEN** a protected admin request is rejected by the rate limiter
- **THEN** the response body does not contain the configured admin API key, the submitted API key, secret comparison details, storage details, stack traces, or gateway implementation details

### Requirement: Rate-limit recovery behavior

The system SHALL provide deterministic reset/recovery behavior for the configured rate-limit window and SHALL include recovery guidance when retry timing can be computed.

#### Scenario: Retry guidance is provided

- **WHEN** a protected admin request is rejected because the authenticated identity exceeded the configured rate limit
- **THEN** the response includes a generic standard error payload
- **AND** the response includes a `Retry-After` header when the reset time can be computed deterministically

#### Scenario: Requests recover after reset

- **WHEN** an authenticated admin identity has exceeded the configured rate limit
- **AND** the configured rate-limit window resets
- **THEN** a subsequent protected admin request for that identity is allowed to proceed to normal endpoint validation and handling

### Requirement: Operational endpoints are not admin rate limited

The system SHALL keep operational endpoints `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics` outside the admin rate limit.

#### Scenario: Operational endpoint remains available without rate-limit budget

- **WHEN** a client sends requests to `GET /health`, `GET /healthz`, `GET /readyz`, or `GET /metrics`
- **THEN** the system applies the current operational endpoint behavior without requiring or consuming admin rate-limit budget

### Requirement: Rate-limit validation is documented

The repository SHALL document how contributors configure and validate local admin rate-limit behavior.

#### Scenario: Local validation instructions cover rate-limit outcomes

- **WHEN** a contributor reads the local documentation for admin rate limiting
- **THEN** the documentation explains how to configure the limit, send an allowed protected admin request, trigger an HTTP 429 response, and verify recovery after reset

#### Scenario: Gateway-dependent checks remain outside verify

- **WHEN** gateway validation requires Docker, Kong, or running services
- **THEN** the validation is documented as a smoke check outside the host-only `npm run verify` completion gate
