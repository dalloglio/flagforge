## Context

FlagForge currently keeps feature flags in `FlagRepository` and audit events in `AuditLogRepository`, both backed by in-memory collections under `src/domain/`. The Express app wires those repositories directly and exposes synchronous route handlers for flag CRUD, evaluation, and audit-log listing.

The approved PRD requires PostgreSQL to become the runtime persistence path while preserving the public API contract. ADR 0005 selects PostgreSQL over SQLite, ADR 0006 keeps this change at the local Docker Compose level before later platform work, and ADR 0016 requires persistence details to stay behind pragmatic hexagonal boundaries.

The existing domain model includes nested rule arrays, optional rollout configuration, and full audit before/after snapshots. Those shapes must survive storage and retrieval without changing evaluation behavior or HTTP response bodies.

## Goals / Non-Goals

**Goals:**

- Persist feature flags and audit events in PostgreSQL.
- Provide repeatable migrations for an empty local PostgreSQL database.
- Add Docker Compose support for a local PostgreSQL service.
- Keep HTTP response shapes, status codes, validation behavior, and error payloads compatible.
- Keep domain rules and evaluation independent from PostgreSQL.
- Preserve audit semantics: only successful mutations are logged, snapshots are immutable, and listing remains oldest-to-newest.
- Add integration tests that exercise a real PostgreSQL-backed path across repository or app lifecycle boundaries.
- Fail clearly when PostgreSQL persistence is unavailable or misconfigured.

**Non-Goals:**

- Kubernetes, Helm, Argo CD, Kong, RDS, cloud provisioning, or production deployment design.
- Authentication, authorization, actor attribution, multi-tenancy, environments, SDKs, or segment management.
- SQLite or a second durable persistence implementation.
- Public API contract changes.
- Backfilling data from previous in-memory process state.
- Admin database UI or operational observability beyond clear startup/runtime diagnostics.

## Decisions

### Use explicit PostgreSQL adapters behind repository contracts

Introduce repository contracts for flag storage and audit-log storage, then provide PostgreSQL implementations outside the pure domain behavior. The in-memory repositories can remain as explicit test doubles for focused unit tests, but the default runtime wiring should construct PostgreSQL-backed repositories.

The intended boundary shape for this change is:

- `src/domain/` keeps feature flag types, schemas, audit event construction, evaluation rules, and domain errors independent from PostgreSQL, Express, and transaction clients.
- Application-level use cases coordinate create, update, read, list, evaluate, and audit-log workflows against repository contracts.
- Infrastructure-level PostgreSQL adapters implement those contracts and own SQL, connection-pool usage, migrations, row hydration, and transaction execution.
- `src/api/` validates HTTP input, calls application use cases, and maps application/domain errors to existing HTTP responses.

Rationale: this follows ADR 0016 by keeping Express and PostgreSQL concerns outside domain rules. It also makes tests honest: persistence tests use PostgreSQL, while non-persistence tests can still inject in-memory doubles.

Alternatives considered:

- Keep concrete in-memory classes as the only repository shape and add PostgreSQL logic beside them. This keeps fewer files initially but makes dependency wiring and persistence behavior harder to reason about.
- Move PostgreSQL calls into route handlers. This is direct but violates the existing API/domain boundary and would make evaluation and audit tests less focused.

### Convert persistence-facing app paths to async

Repository methods and application use cases used by API routes should become asynchronous so the same contracts can support PostgreSQL I/O. Route handlers will `await` application operations while preserving the existing request validation and error mapping behavior.

Rationale: PostgreSQL access is naturally async in Node.js. Hiding async behavior behind synchronous-looking wrappers would add complexity and risk unhandled failures.

Alternatives considered:

- Keep the current synchronous repository contract and preload all rows. This would undermine durability guarantees for concurrent app instances and create stale reads.
- Add separate sync and async repository APIs. This increases duplication without providing product value.

### Store public flag shape using relational keys plus JSONB payload fields

Use a `feature_flags` table keyed by flag key. Store scalar fields (`key`, `enabled`, optional `description`) as columns and nested `rules` plus optional `rollout` as JSONB.

Rationale: the current rules and rollout shapes are small, validated by Zod at the API boundary, and evaluated in TypeScript. JSONB preserves the public shape without prematurely normalizing rule operators into multiple tables.

Alternatives considered:

- Store the whole flag as a single JSONB document. This is flexible but hides important uniqueness and lookup constraints around `key`.
- Fully normalize rules and rollout. This is more queryable but adds migration and write complexity before FlagForge needs database-side rule inspection.

### Store audit events append-only with immutable JSONB snapshots

Use an `audit_events` table with an append sequence, public event ID, timestamp, action, flag key, and JSONB `before`/`after` snapshots. Query audit events ordered by append sequence ascending, with optional filtering by `flag_key`.

Rationale: current audit behavior is append-only and exposes full snapshots. An append sequence preserves oldest-to-newest listing even when timestamps collide or test clocks are fixed.

Alternatives considered:

- Order by `occurred_at` only. This can be unstable for events with identical timestamps.
- Reconstruct audit snapshots from current flag rows. That would break the immutability requirement.

### Make flag mutation plus audit append transactional

Create and update application use cases should write the flag row and corresponding audit event in the same PostgreSQL transaction after validation succeeds. Duplicate keys, missing flags, and invalid payloads must not append audit events.

The transaction boundary belongs to application orchestration plus infrastructure transaction support, not to Express route handlers or pure domain functions. The API must not receive a PostgreSQL transaction client, and domain functions must not import PostgreSQL APIs. The PostgreSQL adapter may expose a focused transaction helper or transactional repository factory so the use case can coordinate both repositories without a broad unit-of-work framework.

For updates, the implementation must capture the previous flag snapshot and persist the updated flag plus audit event inside one transaction. The PostgreSQL path should protect the read-before/write-after sequence with row-level locking or an equivalent atomic SQL flow so concurrent updates cannot produce audit snapshots that do not match the committed mutation.

Rationale: once state is durable, split writes can leave a created flag without an audit event or an audit event without the corresponding mutation. Atomic writes preserve the current successful-mutation semantics.

Alternatives considered:

- Keep separate repository calls without a transaction. This mirrors the current in-memory flow but introduces inconsistent durable states on partial failure.
- Add a broad unit-of-work abstraction for all operations. This may be useful later, but a focused transaction helper around mutation flows is enough for this change.

### Use simple SQL migrations tracked in the database

Add versioned SQL migration files and a Node.js migration runner that records applied migration filenames/checksums in a migrations table. The runner should apply migrations in lexical order and be callable for local setup and tests.

If an already-applied migration filename is found with a different checksum, the runner should fail clearly and stop instead of reapplying, skipping, or mutating the migration history. This keeps local and future GitOps/RDS migration behavior deterministic and reviewable.

Rationale: the project needs a repeatable migration path but does not yet need a heavyweight migration framework. SQL files keep schema changes reviewable and close to PostgreSQL.

Alternatives considered:

- Use an ORM migration system. This adds a larger dependency and abstraction before the repository model needs it.
- Apply schema from test setup only. This would not satisfy local development or future delivery workflow needs.

### Require explicit PostgreSQL configuration for runtime persistence

The server startup path should require a PostgreSQL connection string or equivalent configuration for the default runtime app. Misconfiguration or unavailable PostgreSQL should fail with a clear diagnostic that identifies the category without logging secret values. In-memory repositories remain available only through explicit dependency injection in tests.

Rationale: the PRD requires no silent fallback when persistence is enabled. Explicit failure is safer than returning to volatile in-memory behavior unnoticed.

Alternatives considered:

- Fall back to in-memory storage when `DATABASE_URL` is absent. This is convenient but directly violates the persistence goal.
- Commit local secrets in env files. This is unnecessary and conflicts with repository security guidance.

### Keep local PostgreSQL in Docker Compose only

Add a Compose service for local PostgreSQL with non-secret development defaults and a named volume. Do not add Kubernetes manifests, Helm charts, Argo CD apps, Kong configuration, or cloud database resources in this change.

Rationale: ADR 0006 puts the project at the local platform step before cloud or Kubernetes work, and the user explicitly scoped those platform concerns out.

Alternatives considered:

- Add kind or Helm support together with PostgreSQL. This would mix persistence implementation with later platform delivery work.
- Require developers to install PostgreSQL directly. Compose gives a repeatable local dependency with less host setup.

### Run real PostgreSQL integration tests behind an explicit database harness

Add integration tests that run migrations against a real PostgreSQL database, isolate test data, and prove persistence across repository or app lifecycle boundaries. Unit tests that do not claim persistence can keep using in-memory doubles.

Rationale: ADR 0005 and the PRD require a real PostgreSQL-compatible path for persistence confidence. Lifecycle tests catch serialization, migration, and transaction errors that in-memory tests cannot.

Alternatives considered:

- Mock the PostgreSQL client. This can verify call shapes but not durable behavior.
- Use SQLite for tests. This diverges from the accepted persistence target.

## Risks / Trade-offs

- [Risk] Async repository changes may touch many API tests. -> Mitigation: update app tests in focused steps and preserve assertions for existing HTTP behavior.
- [Risk] JSONB storage can accept malformed data if rows are edited outside the API. -> Mitigation: keep API validation as the write path and re-parse rows with domain schemas when hydrating from PostgreSQL.
- [Risk] Audit ordering can regress under identical timestamps. -> Mitigation: order by append sequence, not only timestamp.
- [Risk] Integration tests can be slow or flaky if database setup is implicit. -> Mitigation: provide clear scripts/harness behavior and fail fast when the configured test database is unavailable.
- [Risk] Transaction boundaries can be split accidentally between flag writes and audit writes. -> Mitigation: implement create/update mutation orchestration through a shared transaction path and cover rejected writes plus successful writes in integration tests.
- [Risk] Concurrent updates can produce stale `before` snapshots if read and write are not protected together. -> Mitigation: capture `before`, write `after`, and append audit inside one transaction using row-level locking or an equivalent atomic SQL flow.
- [Risk] Local configuration may expose secrets in logs. -> Mitigation: sanitize diagnostics and use non-secret Compose defaults only for local development.

## Migration Plan

1. Add PostgreSQL dependency, database configuration parsing, connection pool creation, and sanitized diagnostics.
2. Add Docker Compose PostgreSQL service for local development.
3. Add SQL migration files and a migration runner that can prepare an empty database.
4. Introduce async repository contracts, application use cases, and PostgreSQL-backed infrastructure implementations for flags and audit events.
5. Add focused transaction support for create/update use cases without exposing PostgreSQL transaction clients to API or domain code.
6. Update app/server wiring so default runtime uses PostgreSQL-backed application dependencies and tests can explicitly inject in-memory repositories.
7. Update API routes and tests for async application calls while preserving existing response behavior.
8. Add integration tests that run against real PostgreSQL and prove restart/lifecycle persistence for flags, evaluation, and audit events.
9. Run `npm run verify` with PostgreSQL available.

Rollback for this local change is to stop the app, revert the code/configuration change, and drop the local Compose database volume if the migrated local schema is no longer needed. No production data migration or cloud rollback is in scope.

## Open Questions

None.
