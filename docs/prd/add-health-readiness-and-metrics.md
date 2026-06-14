# PRD: add-health-readiness-and-metrics

## Problem

FlagForge already has PostgreSQL persistence, Docker/CI, and an OpenAPI
contract, but it still exposes only a basic `/health` process check. Before the
project moves toward Kong, Helm, kind, Argo CD, and local observability, the API
needs operational endpoints that distinguish process liveness, dependency
readiness, and metrics exposure.

Without that separation, future local and Kubernetes-style deployments cannot
make clear routing, rollout, scraping, or failure decisions. A database outage
should not imply that the Node.js process is dead, but it should prevent the
service from being considered ready to serve traffic.

## Goals

- Add explicit liveness, readiness, and metrics capabilities for the API runtime.
- Make PostgreSQL dependency readiness visible through a dedicated endpoint.
- Expose Prometheus-compatible runtime and HTTP metrics for local observability
  practice.
- Preserve existing feature flag, evaluation, audit-log, PostgreSQL, Docker, CI,
  and OpenAPI behavior.
- Document local validation steps for operational endpoints.
- Keep operational concerns out of domain logic and aligned with the accepted
  OpenTelemetry, Prometheus, and Grafana direction.

## Non-goals

- Helm chart.
- kind cluster deployment.
- Argo CD.
- Kong Gateway configuration.
- Alerting rules.
- Grafana dashboards.
- OpenTelemetry tracing.
- Full OpenTelemetry Collector setup.
- AWS, EKS, or RDS deployment.
- Changes to feature flag, evaluation, audit-log, or persistence behavior.

## Users

- Developers validating FlagForge locally.
- Contributors preparing platform, gateway, or observability changes.
- QA reviewers checking operational endpoint behavior and regressions.
- SRE and observability reviewers assessing future probe and scraping readiness.
- Future local platform workflows that need liveness, readiness, and metrics
  signals before introducing kind, Helm, Kong, Prometheus, or Grafana.

## Requirements

- The system must expose `GET /healthz` as a process liveness endpoint.
- `/healthz` must return success while the Node.js process is alive, regardless
  of PostgreSQL state.
- The existing `GET /health` endpoint must remain unchanged for backward
  compatibility and continue to behave as the legacy basic health check.
- The system must expose `GET /readyz` as a dependency readiness endpoint.
- `/readyz` must return success only when dependencies required to serve traffic,
  including PostgreSQL, are available.
- `/readyz` must return a non-success status when PostgreSQL is unavailable or a
  readiness check fails.
- `/readyz` must return HTTP `200` with a body that clearly reports ready status
  when all required dependencies are available.
- `/readyz` must return HTTP `503` with a body that reports not-ready status and
  identifies PostgreSQL as unavailable when the database check fails, without
  leaking connection strings, credentials, stack traces, or internal driver
  errors.
- The system must expose `GET /metrics` with Prometheus-compatible metrics.
- Metrics must include a minimal initial HTTP set: request count and request
  duration, labeled only with low-cardinality values such as HTTP method, route
  template, and status code or status class.
- Metrics must include basic runtime/process metrics suitable for local
  Prometheus scraping, such as process CPU, memory, event loop, or equivalent
  default Node.js runtime metrics provided by the selected metrics library.
- Metrics must not leak secrets, API keys, database URLs, request bodies, or
  sensitive context values.
- `/metrics` must be documented as an operational endpoint in README or runbook
  documentation, not as part of the public OpenAPI contract.
- `GET /healthz` and `GET /readyz` must be documented in the OpenAPI contract
  because they are public HTTP endpoints that future platform and gateway work
  may use.
- Existing flag management, flag evaluation, audit-log, persistence, Docker, CI,
  and OpenAPI flows must remain unchanged except for required operational
  endpoint documentation.
- The implementation must preserve architecture boundaries: domain code must not
  depend on Express operational wiring, PostgreSQL readiness mechanics,
  Prometheus, OpenTelemetry, Kubernetes, Kong, or cloud infrastructure.
- OpenSpec artifacts must define liveness, readiness, and metrics behavior before
  implementation.
- The OpenAPI contract must be updated for `GET /healthz` and `GET /readyz`.
- Tests must cover successful liveness, successful readiness, failing readiness,
  and metrics exposure.
- Documentation must explain how to run and verify the operational endpoints
  locally.

## Risks

- Readiness semantics can be confused with liveness, causing future orchestrators
  to restart healthy processes during dependency outages.
- Metrics can accidentally expose sensitive labels or high-cardinality values if
  request inputs are used directly.
- Adding metrics can introduce cross-cutting concerns into domain code if the
  boundary is not kept explicit.
- Prometheus-compatible output can pass superficial checks while omitting useful
  HTTP or runtime signals.
- OpenAPI and runtime behavior can drift if liveness and readiness endpoints are
  documented but not validated.
- Operational documentation can drift from `/metrics` behavior because metrics is
  intentionally excluded from the OpenAPI contract.

## Resolved decisions

- `GET /health` remains unchanged as the legacy basic health endpoint for
  backward compatibility.
- `GET /healthz` is the canonical process liveness endpoint.
- `GET /readyz` is the canonical dependency readiness endpoint.
- `GET /readyz` uses HTTP `503` for not-ready states caused by PostgreSQL
  unavailability or readiness check failure.
- The initial metrics scope includes request count, request duration, and basic
  runtime/process metrics only.
- Metrics labels must stay low-cardinality and must not include raw URLs, request
  bodies, context values, database URLs, API keys, or secrets.
- `GET /metrics` is an operational endpoint documented in README or runbook
  material and is intentionally excluded from the public OpenAPI contract.
- `GET /healthz` and `GET /readyz` are included in OpenAPI because they are
  stable HTTP endpoints used by future platform and gateway work.

## Open questions

None.

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/17
- OpenSpec change id requested by issue: `add-health-readiness-and-metrics`
- Relevant docs: `docs/adr/0006-use-level-1-local-platform-before-cloud.md`,
  `docs/adr/0013-use-opentelemetry-prometheus-and-grafana-for-observability.md`,
  `docs/adr/0014-use-github-actions-for-ci-and-quality-gates.md`,
  `docs/adr/0016-use-hexagonal-architecture-and-ddd-lite.md`,
  `docs/adr/0018-use-role-based-review-gates.md`,
  `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`
