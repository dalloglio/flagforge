## Why

FlagForge currently loses feature flags and audit events whenever the process restarts because runtime state is in memory. PostgreSQL persistence is needed now because the core API, evaluation, rollout, and audit-log behaviors already exist and can be made durable without expanding the public product scope.

## What Changes

- Add PostgreSQL-backed persistence for feature flags and audit events.
- Add a repeatable migration path that prepares an empty local PostgreSQL database for FlagForge state.
- Add a local Docker Compose PostgreSQL service for development and verification.
- Introduce repository-layer adapters so persistence remains behind focused boundaries and domain behavior stays independent of PostgreSQL.
- Add real PostgreSQL integration tests that prove flags and audit events survive repository or application lifecycle boundaries.
- Preserve existing public API response shapes, status codes, validation behavior, evaluation rules, audit-log semantics, and audit-log ordering.
- Fail clearly when PostgreSQL persistence is unavailable or misconfigured instead of silently falling back to in-memory storage.

## Capabilities

### New Capabilities

- `postgresql-persistence`: Durable PostgreSQL storage, migrations, local database setup, repository integration, diagnostics, and real database integration coverage for persisted FlagForge state.

### Modified Capabilities

- `flags-api`: Feature flag create, read, list, and update behavior must remain compatible while using durable PostgreSQL-backed state across restarts.
- `flag-evaluation`: Evaluation must use persisted flag definitions while preserving current targeting and deterministic rollout behavior across restarts.
- `audit-log`: Audit events must be persisted durably, preserve immutable before/after snapshots, and retain existing listing and filtering behavior across restarts.

## Impact

- Affected code: repository implementations and wiring, API dependency setup, migration tooling, database configuration, Docker Compose files, and integration tests.
- Affected specs: new `postgresql-persistence` capability plus deltas for `flags-api`, `flag-evaluation`, and `audit-log`.
- Affected dependencies: PostgreSQL client/migration tooling and local Docker Compose database service.
- Public API impact: no intended contract changes; durable storage changes lifecycle behavior only.
- Out of scope: Kubernetes, RDS, Helm, Argo CD, Kong, authentication, authorization, and multi-tenancy.
