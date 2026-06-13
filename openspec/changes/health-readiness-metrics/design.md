## Context

FlagForge is a TypeScript/Express API with PostgreSQL-backed runtime persistence, explicit in-memory test doubles, a source-controlled OpenAPI contract, and local Docker/CI workflow coverage. The current API exposes `GET /health`, which returns `{ "status": "ok" }` without checking dependencies.

The new operational endpoints must prepare the service for future platform and observability work while preserving existing feature flag, evaluation, audit-log, PostgreSQL, Docker, CI, and legacy `/health` behavior. The existing PostgreSQL persistence spec still requires startup to fail clearly when required database configuration is missing, invalid, or unavailable during startup; this change does not redefine that startup contract.

## Goals / Non-Goals

**Goals:**

- Add explicit process liveness through `GET /healthz`.
- Add dependency readiness through `GET /readyz`, including a PostgreSQL availability check.
- Add Prometheus-compatible `GET /metrics` output with low-cardinality HTTP request metrics and runtime/process metrics.
- Keep operational wiring in API/infrastructure code and out of domain logic.
- Update OpenAPI for `GET /healthz` and `GET /readyz`.
- Document local verification for `/healthz`, `/readyz`, and `/metrics`.

**Non-Goals:**

- Do not add Helm, kind, Argo CD, Kong, Prometheus server, Grafana dashboards, alert rules, OpenTelemetry Collector, tracing, AWS, EKS, or RDS behavior.
- Do not change feature flag, evaluation, audit-log, persistence data model, migration, or repository behavior.
- Do not add authentication, authorization, tenancy, environments, or SDK behavior.
- Do not include `GET /metrics` in the public OpenAPI contract for this change.

## Decisions

### Keep operational endpoints at the API/infrastructure boundary

Add API-layer operational wiring for liveness, readiness, and metrics. Keep the domain and application use cases unaware of Express routes, PostgreSQL readiness probes, Prometheus exposition, OpenTelemetry, Kubernetes, Kong, or cloud infrastructure.

Rationale: operational checks are transport/runtime concerns, not feature flag domain behavior. This follows the existing hexagonal boundary where `src/api/` owns HTTP behavior and `src/infrastructure/postgres/` owns PostgreSQL mechanics.

Alternatives considered:

- Put readiness on repositories or use cases. This would mix operational probe behavior into domain/application flows that should remain focused on feature flag behavior.
- Add a broad observability abstraction now. That would add indirection before there are multiple telemetry providers or a real cross-service boundary.

### Preserve `/health` and add `/healthz` as canonical liveness

Keep `GET /health` unchanged for backward compatibility and add `GET /healthz` returning HTTP 200 with `{ "status": "ok" }` while the Express process can serve requests. The liveness endpoint must not invoke PostgreSQL.

Rationale: existing README, Docker, and smoke-check behavior already references `/health`. Adding `/healthz` gives future orchestrators a conventional liveness endpoint without breaking existing local workflows.

Alternatives considered:

- Rename `/health` to `/healthz`. This would break existing checks and OpenAPI behavior.
- Make `/health` perform dependency checks. This would blur legacy health and readiness semantics.

### Add readiness as injectable dependency checks

Extend `createApp` dependencies with a readiness check function or small dependency object. Runtime wiring injects a PostgreSQL check backed by the existing pool and a simple `select 1`; focused tests can inject passing and failing checks without a real database.

`GET /readyz` returns HTTP 200 with `{"status":"ready","dependencies":{"postgresql":{"status":"available"}}}` when all checks pass. It returns HTTP 503 with `{"status":"not_ready","dependencies":{"postgresql":{"status":"unavailable"}}}` when the PostgreSQL check fails. The response must not expose connection strings, credentials, stack traces, SQL driver messages, or internal error details.

Rationale: injection keeps API tests fast and deterministic while runtime still uses the real PostgreSQL pool. Sanitizing the response protects configuration and dependency details.

Alternatives considered:

- Reuse the startup-only `assertPostgresAvailable` directly in the route. That function currently includes driver error text in its message, which is useful for logs but not suitable for public readiness responses.
- Add integration-only readiness coverage. That would miss the route contract and failure serialization behavior.

### Keep startup availability behavior unchanged

Do not use this change to alter the existing runtime startup requirement that unavailable PostgreSQL during startup fails clearly instead of silently falling back. `server.ts` can continue asserting database availability before listening, while `/readyz` covers readiness for a running process and tests can simulate unavailable dependencies through injection.

Rationale: changing startup behavior would require modifying the PostgreSQL persistence capability and would be broader than the requested operational endpoint scope.

Alternatives considered:

- Start the HTTP process with valid configuration even when PostgreSQL is unavailable. This would make `/healthz` observable during startup dependency outages, but it conflicts with the accepted persistence requirement unless that requirement is changed explicitly.

### Use a Prometheus-compatible metrics library with constrained labels

Add a direct metrics dependency suitable for Prometheus text exposition, such as `prom-client`. Enable default Node.js runtime/process metrics and add HTTP request count and duration metrics with labels limited to method, route template, and status code or status class.

Never use raw URLs, route parameters, request bodies, evaluation context values, database URLs, API keys, or secret values as labels. Use stable dependency names such as `postgresql` and stable fallback route labels such as `unmatched` or `unknown` for unmatched routes rather than the raw path.

Rationale: Prometheus text exposition is the immediate local observability need. A small direct library keeps this change focused without introducing a full OpenTelemetry Collector or dashboard stack.

Alternatives considered:

- Introduce a full OpenTelemetry metrics SDK now. That aligns with the long-term direction, but it is too broad without a collector, exporter, and platform scraping path.
- Hand-roll metrics text. This risks subtle Prometheus format mistakes and avoids proven default runtime metrics.

### Document `/metrics` operationally, not in OpenAPI

Update README or `docs/runbooks/local-development.md` with local commands for `/healthz`, `/readyz`, and `/metrics`. Update OpenAPI only for `/healthz` and `/readyz`.

Rationale: `/healthz` and `/readyz` are stable HTTP endpoints future platform and gateway work may depend on. `/metrics` is an operational scrape endpoint whose response is Prometheus text rather than the JSON API surface already covered by OpenAPI.

Alternatives considered:

- Add `/metrics` to OpenAPI. This would overstate it as part of the public product API and add little value compared with operational documentation.

## Risks / Trade-offs

- Readiness and liveness semantics can drift -> Keep `/healthz` free of dependency checks and test `/readyz` success and failure paths explicitly.
- Readiness failures can leak infrastructure details -> Return sanitized dependency status in HTTP responses and keep detailed dependency errors in logs or internal error handling only.
- Metrics can create high-cardinality label explosions -> Use route templates and bounded status labels; never use raw URLs, parameters, request bodies, context values, or secrets as labels.
- Metrics middleware can accidentally instrument `/metrics` recursively or inconsistently -> Decide explicitly whether `/metrics` is included, and test that exposition remains valid Prometheus text.
- A new metrics dependency can expand production footprint -> Use one focused dependency and verify typecheck, lint, tests, and OpenAPI validation.
- OpenAPI can drift from runtime behavior -> Update `docs/api/openapi.yaml` and keep `npm run openapi:validate` in the completion gate.

## Migration Plan

1. Add operational route and readiness abstractions in API/infrastructure code.
2. Inject PostgreSQL readiness wiring from runtime server setup while preserving existing startup validation behavior.
3. Add metrics registry/middleware and expose `GET /metrics`.
4. Update OpenAPI for `GET /healthz` and `GET /readyz`.
5. Update README or local development runbook with verification commands.
6. Add focused tests for liveness, readiness success, readiness failure, metrics exposure, unchanged `/health`, and OpenAPI validation.
7. Run `npm run verify` before marking implementation complete.

Rollback is straightforward because this change adds endpoints, documentation, tests, and one metrics dependency without database migrations or persistence data changes. Reverting the implementation and dependency changes restores the previous runtime surface.

## Open Questions

None.
