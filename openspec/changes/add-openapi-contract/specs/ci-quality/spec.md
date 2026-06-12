## ADDED Requirements

### Requirement: OpenAPI validation script

The project SHALL provide a canonical npm script for validating the source-controlled OpenAPI contract.

#### Scenario: OpenAPI validation script is available

- **WHEN** a developer inspects `package.json`
- **THEN** the project defines an `openapi:validate` script

#### Scenario: OpenAPI validation detects malformed contract syntax

- **WHEN** a developer runs `npm run openapi:validate`
- **THEN** the command validates the canonical OpenAPI document and exits with a non-zero status when the document is malformed

#### Scenario: OpenAPI validation remains host-only

- **WHEN** a developer runs `npm run openapi:validate`
- **THEN** the command does not require Docker, Docker Compose, PostgreSQL, or a running FlagForge server

### Requirement: Local verification includes OpenAPI validation

The local completion gate SHALL include OpenAPI contract validation.

#### Scenario: Verify runs OpenAPI validation

- **WHEN** a developer runs `npm run verify`
- **THEN** the project runs OpenAPI contract validation in addition to type checking, linting, formatting checks, tests, and strict OpenSpec validation

#### Scenario: OpenAPI validation failure fails verification

- **WHEN** the OpenAPI contract is malformed
- **THEN** `npm run verify` exits with a non-zero status

### Requirement: CI validates OpenAPI contract

The CI workflow SHALL validate the source-controlled OpenAPI contract for pushes and pull requests.

#### Scenario: CI runs OpenAPI validation

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow runs the canonical OpenAPI validation command

#### Scenario: CI fails on malformed OpenAPI contract

- **WHEN** the OpenAPI validation command exits with a non-zero status
- **THEN** the workflow fails
