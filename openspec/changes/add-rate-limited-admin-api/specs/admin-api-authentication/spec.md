## ADDED Requirements

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
