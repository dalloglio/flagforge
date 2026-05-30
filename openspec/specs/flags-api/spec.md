## Purpose

Define the FlagForge HTTP API for health checks and feature flag management.

## Requirements

### Requirement: Health endpoint

The system SHALL expose a health endpoint for verifying that the API process is running.

#### Scenario: Health check succeeds

- **WHEN** a client sends `GET /health`
- **THEN** the system responds with HTTP 200 and a JSON body containing `status` equal to `ok`

### Requirement: Create feature flag

The system SHALL allow clients to create a feature flag with a unique key, enabled state, optional description, and optional rules.

#### Scenario: Valid flag is created

- **WHEN** a client sends `POST /flags` with a valid flag payload using a new key
- **THEN** the system responds with HTTP 201 and the created flag

#### Scenario: Duplicate flag key is rejected

- **WHEN** a client sends `POST /flags` with a key that already exists
- **THEN** the system responds with HTTP 409 and an error describing the duplicate key

#### Scenario: Invalid flag payload is rejected

- **WHEN** a client sends `POST /flags` with an invalid flag payload
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: List feature flags

The system SHALL allow clients to list all feature flags currently stored by the service.

#### Scenario: Flags are listed

- **WHEN** a client sends `GET /flags`
- **THEN** the system responds with HTTP 200 and a JSON array of flags

### Requirement: Read feature flag

The system SHALL allow clients to retrieve a feature flag by key.

#### Scenario: Existing flag is returned

- **WHEN** a client sends `GET /flags/{key}` for an existing flag
- **THEN** the system responds with HTTP 200 and the matching flag

#### Scenario: Missing flag returns not found

- **WHEN** a client sends `GET /flags/{key}` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

### Requirement: Update feature flag

The system SHALL allow clients to update an existing feature flag's enabled state, description, and rules without changing its key.

#### Scenario: Existing flag is updated

- **WHEN** a client sends `PATCH /flags/{key}` with a valid partial update for an existing flag
- **THEN** the system responds with HTTP 200 and the updated flag

#### Scenario: Missing flag update returns not found

- **WHEN** a client sends `PATCH /flags/{key}` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

#### Scenario: Invalid update payload is rejected

- **WHEN** a client sends `PATCH /flags/{key}` with an invalid update payload
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: Consistent API errors

The system SHALL return JSON error responses with a machine-readable error code and human-readable message for client and not-found errors.

#### Scenario: Error response shape is consistent

- **WHEN** an API request fails because of validation, duplicate keys, or missing resources
- **THEN** the system responds with a JSON body containing `error.code` and `error.message`
