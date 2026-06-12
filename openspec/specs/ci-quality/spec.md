## Purpose

Define the repository quality gates, local scripts, automated tests, and CI checks that keep FlagForge changes verifiable.

## Requirements

### Requirement: Local quality scripts

The project SHALL provide npm scripts for running tests, type checking, linting, formatting, local development, and full verification.

#### Scenario: Scripts are available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines `test`, `typecheck`, `lint`, `format`, `format:check`, `verify`, and `dev` scripts

#### Scenario: Verification runs local quality gates

- **WHEN** a developer runs `npm run verify`
- **THEN** the project runs type checking, linting, formatting checks, tests, and strict OpenSpec validation

#### Scenario: Verification does not format files

- **WHEN** a developer runs `npm run verify`
- **THEN** the formatting gate checks formatting without rewriting files

### Requirement: Automated test harness

The project SHALL include automated tests for the REST API and feature flag evaluation behavior.

#### Scenario: Test suite passes locally

- **WHEN** a developer runs `npm test`
- **THEN** the system runs the Vitest test suite and exits successfully when all tests pass

#### Scenario: HTTP behavior is covered

- **WHEN** the test suite runs
- **THEN** it covers successful and error responses for the feature flag API using Supertest

#### Scenario: Evaluation logic is covered

- **WHEN** the test suite runs
- **THEN** it covers enabled flags, disabled flags, matching rules, and non-matching rules

### Requirement: CI workflow

The project SHALL run automated quality checks and strict OpenSpec validation in GitHub Actions for pushes and pull requests.

#### Scenario: CI runs quality gates

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow installs dependencies with `npm ci` and runs typecheck, lint, formatting checks, tests, and strict OpenSpec validation

#### Scenario: CI validates OpenSpec for automation

- **WHEN** GitHub Actions validates OpenSpec
- **THEN** the workflow runs `openspec validate --all --strict --json` directly

#### Scenario: CI fails on broken quality gate

- **WHEN** any required quality command exits with a non-zero status
- **THEN** the workflow fails

### Requirement: Agent completion verification

The project SHALL define a completion verification practice for automated agents and developers.

#### Scenario: Agent verifies before completion

- **WHEN** an agent completes implementation work for a change
- **THEN** the agent runs `npm run verify` before considering the task done

#### Scenario: Agent limits fixes to current change

- **WHEN** `npm run verify` reports failures
- **THEN** the agent fixes only failures directly related to the current change and reports unrelated failures without broad cleanup

### Requirement: Make command wrappers

The project SHALL provide a `Makefile` with thin command wrappers for existing local development, quality, and OpenSpec validation commands.

#### Scenario: Makefile exposes common quality commands

- **WHEN** a developer inspects the `Makefile`
- **THEN** it defines targets for development, tests, type checking, linting, formatting checks, full verification, and strict OpenSpec validation

#### Scenario: Makefile preserves npm scripts as source commands

- **WHEN** a developer runs a Makefile target for an existing npm-backed quality gate
- **THEN** the target invokes the corresponding npm script without replacing or redefining that script's behavior

#### Scenario: Makefile verification remains aligned

- **WHEN** a developer runs the Makefile target for full verification
- **THEN** it invokes `npm run verify`

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
