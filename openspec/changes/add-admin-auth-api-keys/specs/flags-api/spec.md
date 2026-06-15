## ADDED Requirements

### Requirement: Flag management requires admin API key

The system SHALL require a valid admin API key for `POST /flags`, `GET /flags`, `GET /flags/{key}`, and `PATCH /flags/{key}` before applying existing flag management behavior.

#### Scenario: Create flag without valid admin API key is rejected

- **WHEN** a client sends `POST /flags` without a valid `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and does not create a feature flag

#### Scenario: List flags without valid admin API key is rejected

- **WHEN** a client sends `GET /flags` without a valid `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and does not return the feature flag list

#### Scenario: Read flag without valid admin API key is rejected

- **WHEN** a client sends `GET /flags/{key}` without a valid `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and does not return the feature flag

#### Scenario: Update flag without valid admin API key is rejected

- **WHEN** a client sends `PATCH /flags/{key}` without a valid `X-Admin-API-Key`
- **THEN** the system responds with HTTP 401 and does not update the feature flag

#### Scenario: Flag management with valid admin API key preserves existing behavior

- **WHEN** a client sends a valid flag management request with a valid `X-Admin-API-Key`
- **THEN** the system applies the existing success, validation, duplicate-key, and not-found behavior for that endpoint
