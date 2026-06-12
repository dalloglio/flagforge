## Purpose

Define the local containerized runtime, Docker image, Compose workflow, and environment documentation required to run FlagForge with PostgreSQL.

## Requirements

### Requirement: Production Docker image

FlagForge SHALL provide a production Docker image for the API that builds the TypeScript source and runs the compiled ESM server with a version-pinned Node base image, production runtime dependencies, and a non-root runtime user.

#### Scenario: Docker image builds

- **WHEN** a developer or CI runs the documented Docker build command
- **THEN** Docker builds the FlagForge API image successfully from the repository root

#### Scenario: Docker image runs compiled server

- **WHEN** the Docker image starts with valid PostgreSQL configuration
- **THEN** it runs `node dist/src/server.js` instead of a TypeScript watch, `tsx`, or development command

#### Scenario: Docker image uses non-root runtime

- **WHEN** the Docker image starts the API process
- **THEN** the runtime process does not run as the root user

#### Scenario: Docker image excludes unnecessary context

- **WHEN** Docker builds the FlagForge API image
- **THEN** the build context excludes local dependencies, build output, Git metadata, and local environment files

#### Scenario: Docker image serves health endpoint

- **WHEN** the Docker image starts with valid PostgreSQL configuration after migrations have prepared the database
- **THEN** the API responds successfully on the documented `/health` endpoint

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

### Requirement: Local Docker workflow documentation

FlagForge SHALL document how to build and run the local Docker workflow.

#### Scenario: README includes Docker workflow

- **WHEN** a contributor reads `README.md`
- **THEN** it includes the commands for building the Docker image and running the local Compose stack

#### Scenario: Local development runbook includes Docker workflow

- **WHEN** a contributor reads `docs/runbooks/local-development.md`
- **THEN** it includes the commands for starting PostgreSQL, applying migrations, running the app, running tests, and building the Docker image
