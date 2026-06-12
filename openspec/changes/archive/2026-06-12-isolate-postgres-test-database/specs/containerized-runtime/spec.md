## ADDED Requirements

### Requirement: Local Compose test database

FlagForge SHALL provide an isolated local Docker Compose PostgreSQL database for destructive PostgreSQL integration tests.

#### Scenario: Compose starts PostgreSQL test database

- **WHEN** a contributor starts the documented PostgreSQL test database service
- **THEN** PostgreSQL starts with documented non-secret test defaults
- **AND** the test database is distinct from the development runtime database

#### Scenario: Test database uses distinct host access

- **WHEN** a contributor reads the local database documentation
- **THEN** the PostgreSQL integration test database URL uses a distinct database name or host port from the development runtime `DATABASE_URL`

## MODIFIED Requirements

### Requirement: Environment documentation

FlagForge SHALL document the environment variables and local dotenv files required for local Docker, migration, runtime, and PostgreSQL integration test workflows.

#### Scenario: Environment example is available

- **WHEN** a contributor inspects the repository
- **THEN** `.env.example` documents non-secret local defaults for runtime and migration configuration including `DATABASE_URL` and `PORT`
- **AND** `.env.example` does not point PostgreSQL integration tests at the development runtime database

#### Scenario: Test environment file is available

- **WHEN** a contributor inspects the repository
- **THEN** `.env.test` documents non-secret local defaults for PostgreSQL integration tests with `TEST_DATABASE_URL`
- **AND** `TEST_DATABASE_URL` points at the isolated PostgreSQL test database

#### Scenario: Local documentation explains database URLs

- **WHEN** a contributor reads the local development documentation
- **THEN** it explains which database URL is used for runtime migrations, which URL is used for PostgreSQL integration tests, that PostgreSQL integration tests are destructive for the configured test database, and that migrations are an explicit prerequisite before Compose app startup
