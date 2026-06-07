## ADDED Requirements

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
