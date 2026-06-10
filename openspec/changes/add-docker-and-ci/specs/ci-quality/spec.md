## ADDED Requirements

### Requirement: Build script

The project SHALL provide a local npm script that builds the TypeScript project into compiled JavaScript output.

#### Scenario: Build script is available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines a `build` script

#### Scenario: Build script compiles TypeScript

- **WHEN** a developer runs `npm run build`
- **THEN** the command compiles the TypeScript project and exits successfully when the project is buildable

### Requirement: Explicit test scripts

The project SHALL provide separate npm scripts for unit tests and PostgreSQL integration tests.

#### Scenario: Unit test script is available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines a unit test script that runs the non-PostgreSQL Vitest suite

#### Scenario: PostgreSQL integration test script is available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines a PostgreSQL integration test script that runs tests requiring a real PostgreSQL database

### Requirement: Migration script remains canonical

The project SHALL provide a canonical npm script for applying PostgreSQL migrations in local and CI workflows.

#### Scenario: Migration script is available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines a `db:migrate` script

#### Scenario: Migration script is used by CI

- **WHEN** GitHub Actions prepares the PostgreSQL-backed test environment
- **THEN** it runs the canonical migration script before PostgreSQL integration tests

### Requirement: Local verification remains host-only

The project SHALL keep the local completion gate usable without requiring Docker or PostgreSQL.

#### Scenario: Verify script avoids external services

- **WHEN** a developer runs `npm run verify`
- **THEN** the command runs host-only quality checks and does not require Docker, Docker Compose, or a PostgreSQL service

#### Scenario: External-service checks remain explicit

- **WHEN** a developer needs PostgreSQL integration, Docker build, or Compose smoke validation
- **THEN** the project provides separate documented commands or Makefile targets for those checks

### Requirement: CI verifies build and Docker image

The CI workflow SHALL verify the application build and Docker image build in addition to existing quality gates.

#### Scenario: CI runs application build

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow runs `npm run build`

#### Scenario: CI runs Docker build

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow builds the FlagForge Docker image without publishing it to a registry

#### Scenario: CI uses canonical commands

- **WHEN** GitHub Actions runs repository quality gates
- **THEN** named workflow steps call canonical npm scripts or documented Docker commands instead of duplicating Vitest, TypeScript, or migration internals in workflow YAML

### Requirement: CI runs PostgreSQL-backed verification

The CI workflow SHALL run migration and PostgreSQL integration gates against a PostgreSQL service container.

#### Scenario: CI starts PostgreSQL service

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow provides a PostgreSQL service container with non-secret test credentials

#### Scenario: CI applies migrations

- **WHEN** the PostgreSQL service container is ready
- **THEN** the workflow applies migrations against the CI test database before running PostgreSQL integration tests

#### Scenario: CI runs PostgreSQL integration tests

- **WHEN** migrations have completed successfully in CI
- **THEN** the workflow runs the PostgreSQL integration test script with a `TEST_DATABASE_URL` that points at the service container

### Requirement: Makefile exposes Docker and database wrappers

The project SHALL provide Makefile targets for database, migration, build, PostgreSQL integration test, Docker build, and Docker Compose workflows.

#### Scenario: Makefile exposes migration and database commands

- **WHEN** a developer inspects the `Makefile`
- **THEN** it defines targets for starting PostgreSQL and applying migrations

#### Scenario: Makefile exposes build and integration test commands

- **WHEN** a developer inspects the `Makefile`
- **THEN** it defines targets for the build script and PostgreSQL integration test script

#### Scenario: Makefile exposes Docker commands

- **WHEN** a developer inspects the `Makefile`
- **THEN** it defines targets for Docker image build and Docker Compose app startup

#### Scenario: Makefile exposes smoke check command

- **WHEN** a developer inspects the `Makefile`
- **THEN** it defines a target for a local `/health` smoke check against the running app
