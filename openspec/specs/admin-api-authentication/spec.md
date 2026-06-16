## Purpose

Define how FlagForge configures and enforces admin API key authentication for protected administrative endpoints.

## Requirements

### Requirement: Admin API key configuration

The system SHALL configure the admin API key from the `ADMIN_API_KEY` environment variable and SHALL fail application startup outside tests when the value is not configured.

#### Scenario: Configured admin API key allows startup

- **WHEN** the application starts outside tests with `ADMIN_API_KEY` configured
- **THEN** startup succeeds and the configured value is used for admin API authentication

#### Scenario: Missing admin API key fails startup outside tests

- **WHEN** the application starts outside tests without `ADMIN_API_KEY` configured
- **THEN** startup fails before the API begins accepting requests
- **AND** the startup diagnostic reports that `ADMIN_API_KEY` is required for admin API authentication
- **AND** the startup diagnostic does not report the failure as a PostgreSQL persistence initialization problem

#### Scenario: Tests can configure admin authentication explicitly

- **WHEN** tests construct the API with an explicit admin API key configuration
- **THEN** the API uses that key without requiring production secret configuration

### Requirement: Admin API key header authentication

The system SHALL authenticate protected administrative endpoints using the `X-Admin-API-Key` request header.

#### Scenario: Valid admin API key is accepted

- **WHEN** a client sends a protected admin request with `X-Admin-API-Key` equal to the configured admin API key
- **THEN** the system allows the request to proceed to normal endpoint validation and handling

#### Scenario: Missing admin API key is rejected

- **WHEN** a client sends a protected admin request without `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and a generic authentication error response

#### Scenario: Invalid admin API key is rejected

- **WHEN** a client sends a protected admin request with `X-Admin-API-Key` not equal to the configured admin API key
- **THEN** the system responds with HTTP 401 and the same generic authentication error response used for missing credentials

#### Scenario: Query parameter API key is not accepted

- **WHEN** a client sends a protected admin request with an API key only in a query parameter
- **THEN** the system responds as though no supported admin API key was provided

### Requirement: Authentication failure takes precedence over rate limiting

The system SHALL authenticate protected administrative endpoint requests before applying admin rate-limit enforcement.

#### Scenario: Missing credentials are rejected before rate limiting

- **WHEN** a client sends a protected admin request without `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and the generic authentication error response
- **AND** the response is not an HTTP 429 rate-limit response

#### Scenario: Invalid credentials are rejected before rate limiting

- **WHEN** a client sends a protected admin request with `X-Admin-API-Key` not equal to the configured admin API key
- **THEN** the system responds with HTTP 401 and the generic authentication error response
- **AND** the response is not an HTTP 429 rate-limit response

#### Scenario: Invalid credentials do not consume rate-limit budget

- **WHEN** a client sends a protected admin request with missing or invalid admin credentials
- **THEN** the system does not count the request against the admin rate-limit budget for any authenticated identity

### Requirement: Protected administrative endpoint set

The system SHALL require admin API key authentication for `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.

#### Scenario: Protected endpoint requires admin API key

- **WHEN** a client sends a request to any protected administrative endpoint without a valid `X-Admin-API-Key`
- **THEN** the system rejects the request with HTTP 401 before performing the administrative operation

#### Scenario: Protected endpoint succeeds with valid admin API key

- **WHEN** a client sends a valid request to a protected administrative endpoint with a valid `X-Admin-API-Key`
- **THEN** the system applies the existing endpoint behavior for that request

### Requirement: Operational endpoints remain unauthenticated

The system SHALL keep operational endpoints `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics` accessible without the admin API key.

#### Scenario: Health endpoint remains public

- **WHEN** a client sends `GET /health` without `X-Admin-API-Key`
- **THEN** the system responds with HTTP 200 and the health response

#### Scenario: Liveness endpoint remains public

- **WHEN** a client sends `GET /healthz` without `X-Admin-API-Key`
- **THEN** the system responds with HTTP 200 and the liveness response

#### Scenario: Readiness endpoint remains public

- **WHEN** a client sends `GET /readyz` without `X-Admin-API-Key`
- **THEN** the system responds with the current readiness result and not with an authentication failure

#### Scenario: Metrics endpoint remains public

- **WHEN** a client sends `GET /metrics` without `X-Admin-API-Key`
- **THEN** the system responds with Prometheus-compatible metrics text and not with an authentication failure

### Requirement: Authentication failure secrecy

The system SHALL NOT expose configured API keys, secret comparison details, database details, stack traces, or whether credentials were missing versus invalid in authentication failure responses.

#### Scenario: Authentication failure response is generic

- **WHEN** a protected admin request fails authentication
- **THEN** the response body contains a generic error code and message that do not distinguish missing credentials from invalid credentials

#### Scenario: Authentication failure does not leak sensitive details

- **WHEN** a protected admin request fails authentication
- **THEN** the response body does not contain the configured admin API key, submitted API key, secret comparison details, database details, or stack traces
