## 1. Metrics Dependency and Operational Structure

- [x] 1.1 Add a focused Prometheus-compatible metrics dependency, such as `prom-client`, to `package.json` and refresh `package-lock.json`.
- [x] 1.2 Add API/infrastructure operational types or modules for readiness checks and metrics wiring without changing domain or application use case boundaries.
- [x] 1.3 Preserve existing runtime PostgreSQL startup validation behavior while preparing runtime wiring to inject a PostgreSQL readiness check into the Express app.

## 2. Liveness and Readiness Endpoints

- [x] 2.1 Add `GET /healthz` returning HTTP 200 with `{ "status": "ok" }`.
- [x] 2.2 Keep existing `GET /health` behavior unchanged.
- [x] 2.3 Add `GET /readyz` returning HTTP 200 and a ready response when the injected PostgreSQL readiness check succeeds.
- [x] 2.4 Add `GET /readyz` returning HTTP 503 and a sanitized not-ready response identifying PostgreSQL as unavailable when the readiness check fails.
- [x] 2.5 Ensure readiness failure responses do not expose connection strings, credentials, stack traces, SQL driver messages, request bodies, feature flag context values, API keys, or secrets.
- [x] 2.6 Use the stable dependency key `postgresql` in readiness response bodies.

## 3. Metrics Endpoint

- [x] 3.1 Add metrics registry setup with default Node.js runtime or process metrics.
- [x] 3.2 Ensure metrics registry setup can be isolated or reset in tests so metric definitions and observations do not leak across test cases.
- [x] 3.3 Add HTTP request count and request duration metrics with labels limited to method, route template, and status code or status class.
- [x] 3.4 Ensure metrics never use raw URLs, query strings, path parameter values, request bodies, feature flag context values, database URLs, API keys, or secrets as labels.
- [x] 3.5 Add `GET /metrics` returning HTTP 200 with Prometheus-compatible text output and the metrics registry content type.
- [ ] 3.6 Register HTTP metrics before JSON body parsing so malformed JSON `400` responses are counted.

## 4. OpenAPI and Documentation

- [x] 4.1 Update `docs/api/openapi.yaml` to document `GET /healthz` with an HTTP 200 liveness response.
- [x] 4.2 Update `docs/api/openapi.yaml` to document `GET /readyz` with HTTP 200 ready and HTTP 503 not-ready responses.
- [x] 4.3 Add reusable OpenAPI schemas for liveness and readiness responses without documenting `GET /metrics` in OpenAPI.
- [x] 4.4 Update README or `docs/runbooks/local-development.md` with local verification commands for `/healthz`, `/readyz`, and `/metrics`.
- [ ] 4.5 Document that `/healthz` is only observable after successful API startup and does not change startup PostgreSQL validation.

## 5. Tests

- [x] 5.1 Add API tests proving `/healthz` succeeds while an injected readiness check fails.
- [x] 5.2 Add API tests proving `/readyz` returns HTTP 200 with `status: "ready"` and `dependencies.postgresql.status: "available"` when readiness succeeds.
- [x] 5.3 Add API tests proving `/readyz` returns HTTP 503 with `status: "not_ready"` and sanitized `dependencies.postgresql.status: "unavailable"` when readiness fails.
- [x] 5.4 Add regression coverage proving `/health` still returns the existing HTTP 200 `{ "status": "ok" }` response.
- [x] 5.5 Add metrics tests proving `/metrics` returns Prometheus-compatible text, runtime/process metrics, HTTP request count, and HTTP request duration metrics.
- [x] 5.6 Add metrics tests proving labels use route templates or stable fallback labels and do not include raw path parameter values, query strings, request bodies, or context values.
- [x] 5.7 Add metrics tests proving metrics registry setup does not leak duplicate metric definitions or observations across tests.
- [x] 5.8 Add OpenAPI validation coverage through the existing `npm run openapi:validate` command.
- [ ] 5.9 Add metrics regression coverage proving malformed JSON `400` responses are counted and request body content is not exposed.

## 6. Verification

- [x] 6.1 Run focused tests for operational endpoint and metrics behavior.
- [x] 6.2 Run `npm run openapi:validate`.
- [x] 6.3 Run `openspec validate health-readiness-metrics --strict`.
- [x] 6.4 Run `npm run verify` before considering implementation complete.
