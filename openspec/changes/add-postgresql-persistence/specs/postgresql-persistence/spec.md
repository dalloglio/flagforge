## ADDED Requirements

### Requirement: Use PostgreSQL as runtime persistence

The system SHALL use PostgreSQL as the runtime persistence path for feature flags and audit events.

#### Scenario: Runtime uses PostgreSQL storage

- **WHEN** the application starts with valid PostgreSQL configuration
- **THEN** feature flag and audit-log repository operations use PostgreSQL-backed storage

#### Scenario: In-memory repositories are explicit test doubles

- **WHEN** focused unit tests exercise behavior that does not claim durable persistence
- **THEN** they MAY inject in-memory repositories explicitly without changing the runtime persistence path

### Requirement: Fail clearly when PostgreSQL is unavailable

The system SHALL fail clearly when required PostgreSQL configuration is missing, invalid, or points to an unavailable database.

#### Scenario: Missing database configuration fails startup

- **WHEN** the application starts without required PostgreSQL configuration
- **THEN** startup fails with a diagnostic that identifies missing database configuration without logging secret values

#### Scenario: Unavailable database fails persistence-dependent work

- **WHEN** PostgreSQL is unavailable during startup or persistence-dependent work
- **THEN** the system reports a clear PostgreSQL dependency failure and does not silently fall back to in-memory storage

### Requirement: Provide repeatable PostgreSQL migrations

The system SHALL provide a repeatable migration path that prepares an empty PostgreSQL database for FlagForge persistence.

#### Scenario: Empty database is prepared

- **WHEN** migrations are applied to an empty PostgreSQL database
- **THEN** the database contains the schema required to persist feature flags, audit events, and migration history

#### Scenario: Migrations are tracked

- **WHEN** a migration has already been applied successfully
- **THEN** later migration runs recognize the applied migration and do not reapply it

### Requirement: Persist feature flags durably

The system SHALL persist feature flags durably in PostgreSQL, including enabled state, optional description, targeting rules, and rollout configuration.

#### Scenario: Flag survives repository lifecycle

- **WHEN** a feature flag is created or updated through a PostgreSQL-backed repository and a new repository instance reads the same database
- **THEN** the flag is returned with the same public shape and values

#### Scenario: Nested flag configuration survives persistence

- **WHEN** a feature flag with targeting rules and rollout configuration is stored in PostgreSQL
- **THEN** later reads return equivalent rules and rollout configuration for evaluation and API responses

### Requirement: Persist audit events durably

The system SHALL persist audit events durably in PostgreSQL as append-only events with immutable before and after snapshots.

#### Scenario: Audit events survive repository lifecycle

- **WHEN** audit events are appended through a PostgreSQL-backed repository and a new repository instance reads the same database
- **THEN** the events are returned with their IDs, timestamps, actions, flag keys, and before and after snapshots intact

#### Scenario: Audit event order is stable

- **WHEN** persisted audit events are listed globally or by flag key
- **THEN** they are returned from oldest to newest using a stable append order

### Requirement: Mutate flags and audit events atomically

The system SHALL persist each successful flag mutation and its audit event atomically.

#### Scenario: Successful create is atomic

- **WHEN** a client successfully creates a feature flag
- **THEN** the created flag and corresponding `flag_created` audit event are committed together

#### Scenario: Successful update is atomic

- **WHEN** a client successfully updates a feature flag
- **THEN** the updated flag and corresponding `flag_updated` audit event are committed together

#### Scenario: Rejected mutation persists no audit event

- **WHEN** a create or update request is rejected by validation, duplicate-key, or not-found behavior
- **THEN** PostgreSQL contains no audit event for that rejected request

### Requirement: Provide local PostgreSQL through Docker Compose

The system SHALL provide a Docker Compose PostgreSQL service for local development and verification.

#### Scenario: Local database service is available

- **WHEN** the local Docker Compose database service is started
- **THEN** developers have a PostgreSQL database suitable for migrations, development, and integration tests

#### Scenario: Local setup avoids committed secrets

- **WHEN** local database configuration is documented or committed
- **THEN** it uses non-secret development defaults and does not require committed local environment files

### Requirement: Verify persistence with real PostgreSQL integration tests

The system SHALL include integration tests that prove persistence behavior using a real PostgreSQL-backed path.

#### Scenario: Persistence tests use PostgreSQL

- **WHEN** tests claim to verify persistence across repository or application lifecycle boundaries
- **THEN** they use a real PostgreSQL database instead of in-memory repositories or mocked database clients

#### Scenario: Integration tests run migrations

- **WHEN** PostgreSQL integration tests prepare their database
- **THEN** they apply the same migration path used for local setup before exercising persistence behavior
