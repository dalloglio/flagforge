## ADDED Requirements

### Requirement: Audit log access requires admin API key

The system SHALL require a valid admin API key for `GET /audit-log` before applying existing audit log listing behavior.

#### Scenario: List audit log without valid admin API key is rejected

- **WHEN** a client sends `GET /audit-log` without a valid `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and does not return audit events

#### Scenario: List audit log with valid admin API key preserves existing behavior

- **WHEN** a client sends an audit log request with a valid `X-Admin-API-Key`
- **THEN** the system applies the existing audit log success and filter validation behavior for that endpoint
