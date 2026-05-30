## Context

FlagForge currently stores feature flags in memory through `FlagRepository` and exposes create, list, read, update, and evaluate routes from the Express app. The project intentionally avoids persistence, authentication, authorization, tenancy, and other production platform concerns while the API contract is still small.

Audit logging is cross-cutting because it observes successful flag mutations without changing the existing flag management or evaluation response shapes. The design should preserve the current in-memory MVP while keeping audit behavior isolated enough to replace with durable storage later.

## Goals / Non-Goals

**Goals:**

- Record an audit event after each successful feature flag create and update operation.
- Expose recorded audit events through a read-only HTTP endpoint.
- Include stable event fields for action, affected flag key, timestamp, and before/after flag state.
- Keep tests deterministic by allowing time and event ID generation to be controlled in tests.
- Keep audit storage in memory for this change.

**Non-Goals:**

- Durable persistence across process restarts.
- Authentication, authorization, actor identity, tenancy, or request attribution.
- Audit events for reads, list operations, evaluations, failed validation, conflicts, or not-found updates.
- Changes to existing feature flag response bodies or evaluation behavior.

## Decisions

1. Add a dedicated `AuditLogRepository` instead of mixing audit state into `FlagRepository`.

   Rationale: flag storage and audit storage have different responsibilities. Keeping them separate avoids turning the flag repository into a mixed persistence facade and leaves room to replace audit storage later without changing feature flag behavior.

   Alternative considered: store audit events inside `FlagRepository`. This is simpler initially, but couples mutation history to flag CRUD behavior and makes testing the two concerns less focused.

2. Record audit events in the API write path after successful domain mutations.

   Rationale: the API layer already coordinates request validation, repository calls, and HTTP responses. Recording after `create` succeeds and after `update` returns an updated flag ensures rejected requests do not create audit entries.

   Alternative considered: have `FlagRepository` emit audit entries directly. That hides the side effect in domain storage and makes it harder to inject deterministic clocks and ID generation at the app boundary.

3. Use an append-only in-memory audit event model with cloned flag snapshots.

   Rationale: audit entries need to represent the state at the time of mutation. Cloning `before` and `after` snapshots prevents later flag updates from mutating already-recorded history.

   Alternative considered: store only changed fields. That is more compact, but it requires diff logic and produces a less direct contract for this MVP.

4. Expose `GET /audit-log` with optional `flagKey` filtering.

   Rationale: a single list endpoint is enough for clients to inspect global history and narrow results to a specific flag without adding multiple endpoints. It keeps the API small while still useful.

   Alternative considered: expose only `GET /flags/{key}/audit-log`. That is convenient for per-flag history, but it does not support global operational inspection.

5. Inject clock and event ID generation through app dependencies.

   Rationale: tests can assert exact `id` and `occurredAt` values without relying on real time or random values. Production defaults can use `crypto.randomUUID()` and `new Date().toISOString()`.

   Alternative considered: call time and UUID helpers directly in route handlers. That is simpler but makes API tests brittle.

## Risks / Trade-offs

- [Risk] Audit entries are lost on restart because storage is in-memory. -> Mitigation: document this as current MVP behavior and avoid implying durable compliance logging.
- [Risk] Recording full before/after snapshots can grow memory usage. -> Mitigation: accept this for the in-memory MVP and keep the repository isolated for future persistence or retention work.
- [Risk] Without authentication, audit events cannot identify a human actor. -> Mitigation: explicitly exclude actor identity from this change and avoid placeholder actor fields that would imply security guarantees.
- [Risk] API route ordering could accidentally treat `/audit-log` as a flag key if mounted after `/flags/:key` patterns. -> Mitigation: use a top-level `/audit-log` route outside the `/flags/:key` route family.
