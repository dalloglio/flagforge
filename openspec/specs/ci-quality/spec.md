## ADDED Requirements

### Requirement: Local quality scripts

The project SHALL provide npm scripts for running tests, type checking, linting, and local development.

#### Scenario: Scripts are available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines `test`, `typecheck`, `lint`, and `dev` scripts

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

The project SHALL run automated quality checks in GitHub Actions for pushes and pull requests.

#### Scenario: CI runs quality gates

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow installs dependencies with `npm ci` and runs typecheck, lint, and test scripts

#### Scenario: CI fails on broken quality gate

- **WHEN** any required quality command exits with a non-zero status
- **THEN** the workflow fails
