## Problem

FlagForge currently stores feature flags and audit events in memory, so data is lost
whenever the process restarts. This limits the product's ability to behave like a
production-like feature flag API and blocks the next platform learning step that
depends on durable PostgreSQL-backed state.

This change matters now because the core public behaviors already exist: basic
feature flag management, deterministic evaluation, percentage rollout, and audit
log inspection. Persistence can now be introduced while preserving the existing
API contract instead of expanding product scope.

## Goals

- Persist feature flags in PostgreSQL so created and updated flags survive
  application restarts.
- Persist audit events in PostgreSQL so successful flag mutations remain
  available after application restarts.
- Make PostgreSQL the runtime persistence path for this change while allowing
  in-memory repositories only as focused test doubles for behavior that does not
  claim durable persistence.
- Preserve the current public API behavior for flag creation, flag updates, flag
  evaluation, and audit-log listing.
- Keep deterministic evaluation and percentage rollout decisions consistent for
  the same persisted flag and request context.
- Establish PostgreSQL as the persistence path for the project, aligned with
  accepted ADR 0005.
- Provide enough acceptance coverage for API behavior, persistence behavior, and
  regression confidence before implementation is considered complete.

## Non-goals

- No authentication, authorization, tenancy, environments, SDKs, segment
  management, or user management.
- No public API contract changes unless the OpenSpec change explicitly updates
  the affected specs.
- No SQLite persistence path.
- No cloud database provisioning or AWS RDS implementation.
- No kind, Helm, Argo CD, Kong, Prometheus, Grafana, or OpenTelemetry platform
  implementation as part of this feature.
- No Kubernetes or cloud platform database deployment; this change uses local
  Docker Compose only to provide PostgreSQL for development and verification.
- No historical backfill from existing in-memory data across deployments.
- No administrative database UI.

## Users

- Developers using FlagForge as a feature flag API need flags to remain
  available after restarts.
- Contributors practicing specification-driven delivery need a clear persistence
  change that preserves existing behavior while adding durable state.
- Reviewers assessing the project need evidence that the API can evolve toward a
  production-like architecture without uncontrolled scope expansion.
- Operators or platform learners need PostgreSQL to become the foundation for
  later local platform and observability work.

## Requirements

- The system must store feature flags durably in PostgreSQL.
- The system must store audit events durably in PostgreSQL.
- Runtime behavior that claims persistence must use PostgreSQL; in-memory
  repositories may remain only for focused unit tests or non-persistence test
  doubles.
- After a process restart, previously created or updated flags must be readable,
  evaluable, and updateable through the existing API behavior.
- After a process restart, audit events for successful flag mutations must remain
  available through the existing audit-log API behavior.
- Evaluation results must continue to follow the current domain rules for
  enabled state, targeting rules, and percentage rollout.
- Percentage rollout bucketing must remain deterministic for the same flag key
  and normalized rollout attribute value after persistence is introduced.
- API status codes, response shapes, validation behavior, and error payloads must
  remain compatible with the current public contract unless explicitly changed in
  OpenSpec.
- Audit logging must continue to record only successful flag mutations.
- Audit events must retain their required fields, including event ID, timestamp,
  action, flag key, and before/after snapshots.
- Audit-log listing must preserve the current public ordering from oldest to
  newest for both global and `flagKey`-filtered results.
- PostgreSQL configuration must not require committed secrets or local
  environment files.
- PostgreSQL diagnostics must identify the failed dependency or configuration
  category without logging secret values.
- PostgreSQL must be available through a local Docker Compose setup for
  development and verification, aligned with ADR 0005.
- Database schema changes must be represented through a repeatable migration
  path that can prepare the local PostgreSQL database from an empty state.
- The implementation must include test coverage that proves persistence across
  repository or application lifecycle boundaries using a real local
  PostgreSQL-backed path.
- The implementation must keep HTTP concerns in `src/api/`, domain behavior in
  `src/domain/`, and persistence details behind focused infrastructure or
  repository boundaries.
- Before implementation starts, the OpenSpec change must include proposal,
  relevant spec deltas, and tasks covering persistence effects on `flags-api`,
  `flag-evaluation`, `audit-log`, and a dedicated persistence capability when
  durable storage behavior needs its own contract.

### Acceptance criteria

- Given a flag is created, when the application or repository is restarted, then
  the flag can still be retrieved or updated through the existing flag API.
- Given a flag with targeting rules is persisted, when it is evaluated after
  restart, then the result and reason match the current evaluation behavior.
- Given a flag with percentage rollout is persisted, when the same context is
  evaluated before and after restart, then the rollout decision remains stable.
- Given successful flag mutations occurred before restart, when the audit log is
  listed after restart, then those audit events are still returned according to
  the existing audit-log behavior in oldest-to-newest order.
- Given a flag create or update request is rejected, when PostgreSQL persistence
  is enabled, then no audit event is persisted for that rejected mutation.
- Given an audit event is persisted with `before` and `after` snapshots, when the
  flag is updated later, then the existing audit event snapshots remain
  unchanged.
- Given an invalid request is sent to the API, when PostgreSQL persistence is
  enabled, then validation and error responses remain consistent with the
  current contract.
- Given PostgreSQL is unavailable or misconfigured, when the application starts
  or performs persistence-dependent work, then it fails with a clear diagnostic
  message and does not silently fall back to in-memory persistence.
- Given an empty local PostgreSQL database, when migrations are applied, then
  the database is prepared for feature flag and audit-log persistence without
  manual schema edits.
- Given persistence tests are run, when they prove restart behavior, then they
  use a real local PostgreSQL-backed path rather than an in-memory repository.
- Given verification is run before completion, then typecheck, lint, format
  check, tests, and strict OpenSpec validation pass through `npm run verify`.
- Given implementation is ready to begin, then the OpenSpec proposal, spec
  deltas, and task list for this change exist and identify the affected
  capabilities.

## Risks

- Persistence may accidentally change public API behavior, especially response
  ordering, timestamps, error handling, or update semantics.
- PostgreSQL setup can add local development friction if configuration and test
  setup are not documented clearly.
- Integration tests may become slow or flaky if database lifecycle management is
  not scoped carefully.
- JSON-like flag fields, rule definitions, rollout configuration, and audit
  before/after snapshots need a representation that preserves current behavior.
- Audit-log ordering could regress if database queries do not explicitly preserve
  the current oldest-to-newest contract.
- Database failures introduce operational behavior that the current in-memory MVP
  does not exercise.

## Open questions

None.
