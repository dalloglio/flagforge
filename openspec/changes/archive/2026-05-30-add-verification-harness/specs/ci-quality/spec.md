## ADDED Requirements

### Requirement: Agent completion verification

The project SHALL define a completion verification practice for automated agents and developers.

#### Scenario: Agent verifies before completion

- **WHEN** an agent completes implementation work for a change
- **THEN** the agent runs `npm run verify` before considering the task done

#### Scenario: Agent limits fixes to current change

- **WHEN** `npm run verify` reports failures
- **THEN** the agent fixes only failures directly related to the current change and reports unrelated failures without broad cleanup

## MODIFIED Requirements

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
