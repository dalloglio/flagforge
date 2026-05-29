## Context

FlagForge is a new TypeScript service intended to teach OpenSpec, spec-driven development, CI/CD, automated test harnesses, and context engineering through a compact but realistic MVP. The repository already includes Express, Zod, Vitest, Supertest, TypeScript, ESLint, Prettier, and tsx dependencies, but has no application source, specs, or active changes.

The MVP should keep infrastructure simple so the learning focus remains on clear contracts, deterministic behavior, testability, and pipeline enforcement.

## Goals / Non-Goals

**Goals:**

- Provide a REST API for managing feature flags.
- Validate API inputs with typed schemas.
- Evaluate flags deterministically from enabled state, rules, and caller-provided context.
- Keep the service easy to test with isolated in-memory state.
- Add local quality scripts and a GitHub Actions workflow that exercise the test harness.

**Non-Goals:**

- Persistent storage, migrations, or database selection.
- Authentication, authorization, tenancy, or audit logging.
- Percentage rollouts, bucketing, segments, environments, or SDKs.
- Deployment to cloud infrastructure.

## Decisions

### Use Express with a separated app factory

The API will expose an Express `app` from an application factory and start listening from a separate server entrypoint.

Rationale: Supertest can exercise the app directly without opening a network port, and the runtime entrypoint remains small.

Alternative considered: Start the server directly in the main module. This is simpler initially but makes integration tests more brittle.

### Use in-memory storage for the MVP

Flags will be stored in an in-memory repository with explicit create, list, get, and update operations.

Rationale: The MVP is about API contracts, rules, and CI, not data persistence. In-memory state makes tests fast and deterministic.

Alternative considered: SQLite. It is a good next step but introduces schema, migration, and reset concerns before they are needed.

### Use Zod at API boundaries

Request bodies and params will be validated with Zod schemas before domain operations run.

Rationale: Zod is already present and gives clear runtime validation while preserving TypeScript types.

Alternative considered: Manual validation. It creates repetitive code and weakens the contract between specs and implementation.

### Model evaluation as a pure domain function

Flag evaluation will be implemented as a function that accepts a flag and context and returns an evaluation result containing `enabled` and `reason`.

Rationale: A pure evaluator is straightforward to unit test and keeps HTTP concerns separate from domain behavior.

Alternative considered: Put evaluation inside the route handler. This is quick but couples behavior to transport and makes edge cases harder to cover.

### Keep rule support intentionally small

The MVP will support `equals` and `in` operators against string-like context attributes.

Rationale: These operators are enough to demonstrate rule matching, validation, negative cases, and deterministic evaluation without adding rollout complexity.

Alternative considered: Add percentage rollout and hashing. That is useful later but would expand the MVP and distract from the first OpenSpec workflow.

## Risks / Trade-offs

- In-memory state resets on process restart -> Accept for MVP; document persistence as future work.
- No authentication means all API callers can mutate flags -> Accept for local learning service; defer auth to a separate change.
- Simple rule model may not match real feature flag platforms -> Keep the model intentionally small and testable; expand in later specs.
- Express 5 behavior may differ from older examples -> Cover HTTP success and error paths with Supertest.
- CI can drift from local scripts -> GitHub Actions must invoke the same npm scripts developers run locally.
