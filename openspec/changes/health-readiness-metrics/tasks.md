## 1. Metrics Dependency and Operational Structure

- [ ] 1.1 Add a focused Prometheus-compatible metrics dependency, such as `prom-client`, to `package.json` and refresh `package-lock.json`.
- [ ] 1.2 Add API/infrastructure operational types or modules for readiness checks and metrics wiring without changing domain or application use case boundaries.
- [ ] 1.3 Preserve existing runtime PostgreSQL startup validation behavior while preparing runtime wiring to inject a PostgreSQL readiness check into the Express app.

## 2. Liveness and Readiness Endpoints

- [ ] 2.1 Add `GET /healthz` returning HTTP 200 with `{ "status": "ok" }`.
- [ ] 2.2 Keep existing `GET /health` behavior unchanged.
- [ ] 2.3 Add `GET /readyz` returning HTTP 200 and a ready response when the injected PostgreSQL readiness check succeeds.
- [ ] 2.4 Add `GET /readyz` returning HTTP 503 and a sanitized not-ready response identifying PostgreSQL as unavailable when the readiness check fails.
- [ ] 2.5 Ensure readiness failure responses do not expose connection strings, credentials, stack traces, SQL driver messages, request bodies, feature flag context values, API keys, or secrets.
- [ ] 2.6 Use the stable dependency key `postgresql` in readiness response bodies.

## 3. Metrics Endpoint

- [ ] 3.1 Add metrics registry setup with default Node.js runtime or process metrics.
- [ ] 3.2 Ensure metrics registry setup can be isolated or reset in tests so metric definitions and observations do not leak across test cases.
- [ ] 3.3 Add HTTP request count and request duration metrics with labels limited to method, route template, and status code or status class.
- [ ] 3.4 Ensure metrics never use raw URLs, query strings, path parameter values, request bodies, feature flag context values, database URLs, API keys, or secrets as labels.
- [ ] 3.5 Add `GET /metrics` returning HTTP 200 with Prometheus-compatible text output and the metrics registry content type.

## 4. OpenAPI and Documentation

- [ ] 4.1 Update `docs/api/openapi.yaml` to document `GET /healthz` with an HTTP 200 liveness response.
- [ ] 4.2 Update `docs/api/openapi.yaml` to document `GET /readyz` with HTTP 200 ready and HTTP 503 not-ready responses.
- [ ] 4.3 Add reusable OpenAPI schemas for liveness and readiness responses without documenting `GET /metrics` in OpenAPI.
- [ ] 4.4 Update README or `docs/runbooks/local-development.md` with local verification commands for `/healthz`, `/readyz`, and `/metrics`.

## 5. Tests

- [ ] 5.1 Add API tests proving `/healthz` succeeds while an injected readiness check fails.
- [ ] 5.2 Add API tests proving `/readyz` returns HTTP 200 with `status: "ready"` and `dependencies.postgresql.status: "available"` when readiness succeeds.
- [ ] 5.3 Add API tests proving `/readyz` returns HTTP 503 with `status: "not_ready"` and sanitized `dependencies.postgresql.status: "unavailable"` when readiness fails.
- [ ] 5.4 Add regression coverage proving `/health` still returns the existing HTTP 200 `{ "status": "ok" }` response.
- [ ] 5.5 Add metrics tests proving `/metrics` returns Prometheus-compatible text, runtime/process metrics, HTTP request count, and HTTP request duration metrics.
- [ ] 5.6 Add metrics tests proving labels use route templates or stable fallback labels and do not include raw path parameter values, query strings, request bodies, or context values.
- [ ] 5.7 Add metrics tests proving metrics registry setup does not leak duplicate metric definitions or observations across tests.
- [ ] 5.8 Add OpenAPI validation coverage through the existing `npm run openapi:validate` command.

## 6. Verification

- [ ] 6.1 Run focused tests for operational endpoint and metrics behavior.
- [ ] 6.2 Run `npm run openapi:validate`.
- [ ] 6.3 Run `openspec validate health-readiness-metrics --strict`.
- [ ] 6.4 Run `npm run verify` before considering implementation complete.
