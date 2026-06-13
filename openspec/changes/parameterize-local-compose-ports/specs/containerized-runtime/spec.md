## MODIFIED Requirements

### Requirement: Local Compose application stack

FlagForge SHALL provide a Docker Compose workflow that can run the API together with PostgreSQL for local development.

#### Scenario: Compose starts PostgreSQL

- **WHEN** a developer starts the local Docker Compose stack
- **THEN** PostgreSQL starts with documented non-secret development defaults

#### Scenario: Compose starts API with database configuration

- **WHEN** a developer starts the local Docker Compose app service after running the documented canonical migration command
- **THEN** the API starts with a `DATABASE_URL` that points at the Compose PostgreSQL service

#### Scenario: Compose keeps migrations explicit

- **WHEN** a developer starts the local Docker Compose app service
- **THEN** the app service does not run database migrations automatically as part of application startup

#### Scenario: Compose exposes API port

- **WHEN** the local Docker Compose app service is running
- **THEN** the API is reachable from the host through the documented local port

#### Scenario: Compose supports configurable API host port

- **WHEN** a developer starts the local Docker Compose app service with `PORT` set to a non-default host port
- **THEN** the API is reachable from the host through that configured port
- **AND** the default remains port `3000` when `PORT` is absent

#### Scenario: Compose supports configurable runtime database host port

- **WHEN** a developer starts the local PostgreSQL Compose service with `DATABASE_PORT` set to a non-default host port
- **THEN** the runtime PostgreSQL service is reachable from the host through that configured port
- **AND** the default remains port `5432` when `DATABASE_PORT` is absent

#### Scenario: Compose supports health smoke check

- **WHEN** the local Docker Compose app service is running after migrations
- **THEN** the documented smoke check against `/health` succeeds from the host

### Requirement: Local Compose test database

FlagForge SHALL provide an isolated local Docker Compose PostgreSQL database for destructive PostgreSQL integration tests.

#### Scenario: Compose starts PostgreSQL test database

- **WHEN** a contributor starts the documented PostgreSQL test database service
- **THEN** PostgreSQL starts with documented non-secret test defaults
- **AND** the test database is distinct from the development runtime database

#### Scenario: Test database uses distinct host access

- **WHEN** a contributor reads the local database documentation
- **THEN** the PostgreSQL integration test database URL uses a distinct database name or host port from the development runtime `DATABASE_URL`

#### Scenario: Compose supports configurable test database host port

- **WHEN** a contributor starts the PostgreSQL integration test database Compose service with `TEST_DATABASE_PORT` set to a non-default host port
- **THEN** the test PostgreSQL service is reachable from the host through that configured port
- **AND** the default remains port `5433` when `TEST_DATABASE_PORT` is absent

### Requirement: Environment documentation

FlagForge SHALL document the environment variables and local dotenv files required for local Docker, migration, runtime, parallel worktree, and PostgreSQL integration test workflows.

#### Scenario: Environment example is available

- **WHEN** a contributor inspects the repository
- **THEN** `.env.example` documents non-secret local defaults for runtime and migration configuration including `COMPOSE_PROJECT_NAME`, `DATABASE_URL`, `DATABASE_PORT`, and `PORT`
- **AND** `.env.example` does not point PostgreSQL integration tests at the development runtime database

#### Scenario: Test environment file is available

- **WHEN** a contributor inspects the repository
- **THEN** `.env.test` documents non-secret local defaults for PostgreSQL integration tests with `TEST_DATABASE_URL` and `TEST_DATABASE_PORT`
- **AND** `TEST_DATABASE_URL` points at the isolated PostgreSQL test database

#### Scenario: Local documentation explains database URLs

- **WHEN** a contributor reads the local development documentation
- **THEN** it explains which database URL is used for runtime migrations, which URL is used for PostgreSQL integration tests, that PostgreSQL integration tests are destructive for the configured test database, and that migrations are an explicit prerequisite before Compose app startup

#### Scenario: Local documentation explains parallel worktree ports

- **WHEN** a contributor reads the local development documentation
- **THEN** it explains how to run multiple local worktrees with distinct `COMPOSE_PROJECT_NAME`, `PORT`, `DATABASE_PORT`, `TEST_DATABASE_PORT`, `DATABASE_URL`, and `TEST_DATABASE_URL` values
- **AND** it shows at least one example using non-default API, runtime PostgreSQL, and test PostgreSQL host ports

### Requirement: Local Docker workflow documentation

FlagForge SHALL document how to build and run the local Docker workflow.

#### Scenario: README includes Docker workflow

- **WHEN** a contributor reads `README.md`
- **THEN** it includes the commands for building the Docker image and running the local Compose stack

#### Scenario: README mentions configurable local ports

- **WHEN** a contributor reads `README.md`
- **THEN** it identifies the environment variables used to override the local API, runtime PostgreSQL, and test PostgreSQL host ports

#### Scenario: Local development runbook includes Docker workflow

- **WHEN** a contributor reads `docs/runbooks/local-development.md`
- **THEN** it includes the commands for starting PostgreSQL, applying migrations, running the app, running tests, and building the Docker image
