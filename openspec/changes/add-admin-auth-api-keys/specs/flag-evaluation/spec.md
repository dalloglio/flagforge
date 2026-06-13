## ADDED Requirements

### Requirement: Feature flag evaluation requires admin API key

The system SHALL require a valid admin API key for `POST /flags/{key}/evaluate` before applying existing evaluation behavior.

#### Scenario: Evaluate flag without valid admin API key is rejected

- **WHEN** a client sends `POST /flags/{key}/evaluate` without a valid `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and does not evaluate the feature flag

#### Scenario: Evaluate flag with valid admin API key preserves existing behavior

- **WHEN** a client sends an evaluation request with a valid `X-Admin-API-Key`
- **THEN** the system applies the existing evaluation success, validation, and not-found behavior for that endpoint
