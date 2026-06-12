## ADDED Requirements

### Requirement: PostgreSQL integration tests require explicit test database

The PostgreSQL integration test harness SHALL require `TEST_DATABASE_URL` and SHALL NOT fall back to `DATABASE_URL`.

#### Scenario: Test database URL is present

- **WHEN** the PostgreSQL integration test script runs with `TEST_DATABASE_URL` configured
- **THEN** the suite connects to the configured PostgreSQL test database

#### Scenario: Test database URL is absent

- **WHEN** the PostgreSQL integration test script runs without `TEST_DATABASE_URL`
- **THEN** the suite does not connect to `DATABASE_URL`
- **AND** it reports that `TEST_DATABASE_URL` is required for PostgreSQL integration tests

#### Scenario: Runtime database URL is present without test database URL

- **WHEN** the PostgreSQL integration test script runs with `DATABASE_URL` configured and `TEST_DATABASE_URL` absent
- **THEN** the suite does not connect to the runtime database
- **AND** no feature flags or audit events are truncated from the runtime database

## MODIFIED Requirements

### Requirement: CI runs PostgreSQL-backed verification

The CI workflow SHALL run migration and PostgreSQL integration gates against a PostgreSQL service container through explicit test database configuration.

#### Scenario: CI starts PostgreSQL service

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow provides a PostgreSQL service container with non-secret test credentials

#### Scenario: CI applies migrations

- **WHEN** the PostgreSQL service container is ready
- **THEN** the workflow applies migrations against the CI test database before running PostgreSQL integration tests

#### Scenario: CI runs PostgreSQL integration tests

- **WHEN** migrations have completed successfully in CI
- **THEN** the workflow runs the PostgreSQL integration test script with a `TEST_DATABASE_URL` that points at the service container
- **AND** the integration test harness does not fall back to `DATABASE_URL`
