## MODIFIED Requirements

### Requirement: Create feature flag

The system SHALL allow clients to create a feature flag with a unique key, enabled state, optional description, optional rules, and optional rollout configuration.

#### Scenario: Valid flag is created

- **WHEN** a client sends `POST /flags` with a valid flag payload using a new key
- **THEN** the system responds with HTTP 201 and the created flag

#### Scenario: Valid flag with rollout is created

- **WHEN** a client sends `POST /flags` with valid rollout configuration containing an integer `percentage` from `0` through `100` and a non-empty `attribute`
- **THEN** the system responds with HTTP 201 and the created flag including the rollout configuration

#### Scenario: Duplicate flag key is rejected

- **WHEN** a client sends `POST /flags` with a key that already exists
- **THEN** the system responds with HTTP 409 and an error describing the duplicate key

#### Scenario: Invalid flag payload is rejected

- **WHEN** a client sends `POST /flags` with an invalid flag payload
- **THEN** the system responds with HTTP 400 and validation error details

#### Scenario: Invalid rollout payload is rejected

- **WHEN** a client sends `POST /flags` with rollout configuration containing an invalid percentage or missing attribute
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: Update feature flag

The system SHALL allow clients to update an existing feature flag's enabled state, description, rules, and rollout configuration without changing its key.

#### Scenario: Existing flag is updated

- **WHEN** a client sends `PATCH /flags/{key}` with a valid partial update for an existing flag
- **THEN** the system responds with HTTP 200 and the updated flag

#### Scenario: Existing flag rollout is updated

- **WHEN** a client sends `PATCH /flags/{key}` with valid rollout configuration for an existing flag
- **THEN** the system responds with HTTP 200 and the updated flag including the rollout configuration

#### Scenario: Missing flag update returns not found

- **WHEN** a client sends `PATCH /flags/{key}` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

#### Scenario: Invalid update payload is rejected

- **WHEN** a client sends `PATCH /flags/{key}` with an invalid update payload
- **THEN** the system responds with HTTP 400 and validation error details

#### Scenario: Invalid rollout update payload is rejected

- **WHEN** a client sends `PATCH /flags/{key}` with invalid rollout configuration
- **THEN** the system responds with HTTP 400 and validation error details
