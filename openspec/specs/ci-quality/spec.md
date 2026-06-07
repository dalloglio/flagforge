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
