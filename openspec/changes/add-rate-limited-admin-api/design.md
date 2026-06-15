## Context

FlagForge already protects administrative endpoints with `X-Admin-API-Key` and exposes local Kong routing without making application code depend on Kong. The PRD and issue #20 require a predictable local rate-limit contract for protected admin requests while preserving authentication behavior, operational endpoints, direct app access, and existing flag, audit-log, and PostgreSQL semantics.

## Goals / Non-Goals

**Goals:**

- Enforce a configurable local admin rate limit with a non-secret default of 60 protected admin requests per minute per authenticated admin identity.
- Apply rate limiting only after successful admin authentication, so missing or invalid credentials continue to return HTTP `401`.
- Return HTTP `429` with a generic standard error payload and deterministic recovery guidance for over-limit protected admin requests.
- Keep `/health`, `/healthz`, `/readyz`, and `/metrics` outside the admin rate limit.
- Keep application source independent from Kong-specific packages, configuration, and runtime branching.
- Provide deterministic host-only tests for application-level behavior and separate documentation or smoke checks for gateway validation.

**Non-Goals:**

- User accounts, RBAC, billing quotas, tenancy, or commercial plan limits.
- Distributed production rate-limit storage.
- AWS WAF, AWS API Gateway, ALB policy, or cloud edge controls.
- Changing feature flag evaluation, audit event construction, or PostgreSQL persistence behavior.
- Adding Kong-specific logic to `src/`.

## Decisions

### Enforce the first rate limit in the application

The first implementation will enforce rate limits in Express middleware after `createAdminAuthGuard` succeeds and before JSON parsing, request validation, or use-case execution. This protects both direct local app access and traffic routed through Kong. It also matches the current local Kong spec, which keeps direct app access available and requires application source to remain independent from Kong.

Alternatives considered:

- Gateway-only enforcement in Kong: aligns with gateway learning, but direct local API access is intentionally still available and would bypass the limit unless another app-level control was added.
- Split enforcement now: more realistic long term, but adds duplicated behavior and more operational surface before there is a production-grade distributed store.

Gateway validation remains useful as a smoke check that proxied requests observe the same application-level behavior, but the source of truth for the first behavior is host-testable application middleware.

### Use local fixed-window accounting with injectable time

Use in-process fixed-window counters keyed by authenticated admin identity. The default policy is 60 requests per 60,000 milliseconds. The implementation should support dependency injection for time and policy in tests so allow, deny, and reset/recovery behavior is deterministic without sleeping.

Alternatives considered:

- Token bucket: smoother under bursty traffic, but more complexity than needed for the first local learning target.
- PostgreSQL-backed or Redis-backed counters: closer to multi-instance production behavior, but explicitly out of scope for this local-development feature.

### Identify the caller without exposing secrets

The rate limiter will account per authenticated admin identity. Because the current product has one configured admin API key and no user model, the implementation can use a stable internal identity for the accepted configured key rather than storing or emitting the raw key. If later gateway work supplies a distinct authenticated consumer or key identity, the rate limiter boundary can accept that identity without changing domain code.

Rate-limit responses, logs, metrics, and docs must not expose configured keys, submitted keys, secret comparison details, storage internals, stack traces, or gateway implementation details.

### Use standard API error shape for rate-limit responses

Over-limit requests return HTTP `429` with the existing standard error response shape and a new generic error code, for example `rate_limited`. When retry timing is deterministic, responses include `Retry-After` with the number of seconds until the current window resets.

OpenAPI must document `429` for protected administrative operations. Operational endpoints remain unauthenticated and outside rate-limit documentation.

### Configure through application configuration

The limit must have a documented non-secret local default. Implementation should add explicit configuration parsing for admin rate limiting rather than reading environment variables inside route handlers or domain code. Invalid configuration should fail startup with a clear diagnostic instead of silently disabling the limit.

## Risks / Trade-offs

- In-memory counters are per process and reset on restart -> Document this as local-development behavior, not distributed production quota enforcement.
- Fixed windows can allow boundary bursts -> Accept for the first implementation because the requirement is predictable local behavior, not production traffic shaping.
- Time-based tests can be flaky -> Inject time or a clock into the limiter and test reset behavior without real waits.
- Rate-limit responses could leak secrets or policy internals -> Use generic error payloads and only expose recovery guidance such as `Retry-After`.
- Gateway-only expectations could be misunderstood -> Document that enforcement is application-level for this change and that gateway smoke validation proves proxied traffic reaches the same behavior.

## Migration Plan

1. Add application rate-limit configuration with a default of 60 requests per minute and startup validation for overrides.
2. Add admin rate-limit middleware and wire it after admin authentication on protected routes.
3. Update API error typing, OpenAPI, and local docs for `429` responses and `Retry-After`.
4. Add unit and API tests for below-limit, over-limit, authentication precedence, operational endpoint exclusion, and reset/recovery behavior.
5. Add or update gateway/local smoke documentation if proxied validation is available, keeping Docker/Kong checks outside `npm run verify`.

Rollback is removal of the middleware wiring and related docs/OpenAPI changes before release; there is no data migration.

## Open Questions

None.
