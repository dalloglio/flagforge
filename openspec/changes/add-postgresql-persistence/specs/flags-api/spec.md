## MODIFIED Requirements

### Requirement: Create feature flag
The system SHALL allow clients to create a feature flag with a unique key, enabled state, optional description, optional rules, and optional rollout configuration, and SHALL persist successfully created flags durably in PostgreSQL.

#### Scenario: Valid flag is created
- **WHEN** a client sends `POST /flags` with a valid flag payload using a new key
- **THEN** the system responds with HTTP 201 and the created flag

#### Scenario: Valid flag with rollout is created
- **WHEN** a client sends `POST /flags` with valid rollout configuration containing an integer `percentage` from `0` through `100` and a non-empty `attribute`
- **THEN** the system responds with HTTP 201 and the created flag including the rollout configuration

#### Scenario: Created flag survives restart
- **WHEN** a client creates a valid feature flag and the application or repository is restarted against the same migrated PostgreSQL database
- **THEN** the flag can still be retrieved through `GET /flags/{key}` with the same public response shape and values

#### Scenario: Duplicate flag key is rejected
- **WHEN** a client sends `POST /flags` with a key that already exists
- **THEN** the system responds with HTTP 409 and an error describing the duplicate key

#### Scenario: Invalid flag payload is rejected
- **WHEN** a client sends `POST /flags` with an invalid flag payload
- **THEN** the system responds with HTTP 400 and validation error details

#### Scenario: Invalid rollout payload is rejected
- **WHEN** a client sends `POST /flags` with rollout configuration containing an invalid percentage or missing attribute
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: List feature flags
The system SHALL allow clients to list all feature flags currently stored by the service, including flags persisted in PostgreSQL before the current application lifecycle.

#### Scenario: Flags are listed
- **WHEN** a client sends `GET /flags`
- **THEN** the system responds with HTTP 200 and a JSON array of flags

#### Scenario: Persisted flags are listed after restart
- **WHEN** feature flags were persisted before an application or repository restart
- **THEN** `GET /flags` returns those flags from PostgreSQL without requiring them to be recreated

### Requirement: Read feature flag
The system SHALL allow clients to retrieve a feature flag by key from PostgreSQL-backed state.

#### Scenario: Existing flag is returned
- **WHEN** a client sends `GET /flags/{key}` for an existing flag
- **THEN** the system responds with HTTP 200 and the matching flag

#### Scenario: Persisted flag is returned after restart
- **WHEN** a feature flag exists in PostgreSQL from a previous application or repository lifecycle
- **THEN** `GET /flags/{key}` responds with HTTP 200 and the matching flag

#### Scenario: Missing flag returns not found
- **WHEN** a client sends `GET /flags/{key}` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

### Requirement: Update feature flag
The system SHALL allow clients to update an existing feature flag's enabled state, description, rules, and rollout configuration without changing its key, and SHALL persist successful updates durably in PostgreSQL.

#### Scenario: Existing flag is updated
- **WHEN** a client sends `PATCH /flags/{key}` with a valid partial update for an existing flag
- **THEN** the system responds with HTTP 200 and the updated flag

#### Scenario: Existing flag rollout is updated
- **WHEN** a client sends `PATCH /flags/{key}` with valid rollout configuration for an existing flag
- **THEN** the system responds with HTTP 200 and the updated flag including the rollout configuration

#### Scenario: Updated flag survives restart
- **WHEN** a client updates an existing feature flag and the application or repository is restarted against the same migrated PostgreSQL database
- **THEN** subsequent reads return the updated flag state without requiring the update to be repeated

#### Scenario: Missing flag update returns not found
- **WHEN** a client sends `PATCH /flags/{key}` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

#### Scenario: Invalid update payload is rejected
- **WHEN** a client sends `PATCH /flags/{key}` with an invalid update payload
- **THEN** the system responds with HTTP 400 and validation error details

#### Scenario: Invalid rollout update payload is rejected
- **WHEN** a client sends `PATCH /flags/{key}` with invalid rollout configuration
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: Consistent API errors
The system SHALL return JSON error responses with a machine-readable error code and human-readable message for client and not-found errors, and PostgreSQL persistence SHALL NOT change validation, duplicate-key, or not-found response contracts.

#### Scenario: Error response shape is consistent
- **WHEN** an API request fails because of validation, duplicate keys, or missing resources
- **THEN** the system responds with a JSON body containing `error.code` and `error.message`
