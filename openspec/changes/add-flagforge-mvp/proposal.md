## Why

FlagForge needs a small but realistic MVP to exercise OpenSpec, spec-driven development, automated tests, CI/CD, and context engineering against a concrete service. A feature flag API is compact enough to complete quickly while still exposing useful API design, validation, domain logic, and quality-gate decisions.

## What Changes

- Add a REST API for creating, listing, reading, updating, and evaluating feature flags.
- Add request and response validation for flag management and evaluation workflows.
- Add a deterministic flag evaluation model using enabled state and simple context-matching rules.
- Add an automated test harness covering HTTP behavior and flag evaluation logic.
- Add GitHub Actions CI to run install, typecheck, lint, and tests on pushes and pull requests.

## Capabilities

### New Capabilities

- `flags-api`: Covers REST endpoints, validation, response shapes, and error behavior for feature flag management.
- `flag-evaluation`: Covers deterministic evaluation of a flag against a request context and rule set.
- `ci-quality`: Covers local quality scripts and the GitHub Actions pipeline required for the MVP.

### Modified Capabilities

None.

## Impact

- Adds an Express-based TypeScript API surface under the application source tree.
- Adds in-memory flag storage suitable for the MVP and test isolation.
- Adds Zod validation schemas for API inputs.
- Adds Vitest and Supertest coverage for unit and integration behavior.
- Adds npm scripts for typecheck, lint, test, and development execution.
- Adds a GitHub Actions workflow under `.github/workflows/`.
