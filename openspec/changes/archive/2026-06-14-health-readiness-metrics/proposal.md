## Why

FlagForge currently exposes only a basic `/health` process check, even though it already has PostgreSQL persistence, Docker/CI, and a source-controlled OpenAPI contract. Before the project moves toward Kong, Helm, kind, Argo CD, and local observability, the API needs separate operational signals for process liveness, dependency readiness, and Prometheus-compatible metrics.

## What Changes

- Preserve `GET /health` as the unchanged legacy basic health endpoint.
- Add `GET /healthz` as the canonical process liveness endpoint that succeeds while the Node.js process is alive, regardless of PostgreSQL state.
- Add `GET /readyz` as the canonical dependency readiness endpoint that checks PostgreSQL and returns `503` with a sanitized not-ready response when the database check fails.
- Add `GET /metrics` as an operational Prometheus-compatible endpoint with low-cardinality HTTP request metrics and basic Node.js runtime/process metrics.
- Ensure HTTP request metrics count all served responses, including malformed JSON `400` responses rejected by body parsing, without leaking request bodies or other input values into labels.
- Document `/healthz` and `/readyz` in the OpenAPI contract.
- Document `/metrics` in operational documentation, but keep it out of the public OpenAPI contract.
- Clarify in operational documentation that `/healthz` is only observable after the process has successfully started; startup PostgreSQL validation remains unchanged.
- Add focused API, readiness failure, metrics, OpenAPI, and documentation validation coverage.

## Capabilities

### New Capabilities

- `health-readiness-metrics`: Defines process liveness, dependency readiness, and Prometheus-compatible operational metrics behavior for the API runtime.

### Modified Capabilities

- `api-contract`: Adds OpenAPI coverage for the new public `GET /healthz` and `GET /readyz` operational endpoints while keeping `GET /metrics` documented only in operational docs.

## Impact

- API impact: add `GET /healthz`, `GET /readyz`, and `GET /metrics`; keep existing flag, evaluation, audit-log, persistence, and `GET /health` behavior unchanged.
- Application/infrastructure impact: add an explicit PostgreSQL readiness check behind an API/infrastructure boundary without adding operational concerns to domain logic.
- Metrics impact: add a Prometheus-compatible metrics library and middleware or API-layer instrumentation with low-cardinality labels only.
- Contract impact: update `docs/api/openapi.yaml` for `/healthz` and `/readyz`, and validate with the existing OpenAPI tooling.
- Documentation impact: update README or the local development runbook with operational endpoint verification steps, including `/metrics`, and explain startup prerequisites for observing `/healthz`.
- Test impact: add Supertest and focused unit coverage for liveness, successful readiness, failing readiness, metrics exposure, malformed JSON metrics coverage, and regression coverage for the unchanged `/health` behavior.
