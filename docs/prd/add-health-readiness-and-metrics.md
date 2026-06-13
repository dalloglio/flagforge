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
- The system must expose `GET /readyz` as a dependency readiness endpoint.
- `/readyz` must return success only when dependencies required to serve traffic,
  including PostgreSQL, are available.
- `/readyz` must return a non-success status when PostgreSQL is unavailable or a
  readiness check fails.
- The system must expose `GET /metrics` with Prometheus-compatible metrics.
- Metrics must include runtime and HTTP signals useful for local validation.
- Metrics must not leak secrets, API keys, database URLs, request bodies, or
  sensitive context values.
- Existing `/health` behavior must remain unchanged unless the OpenSpec change
  explicitly supersedes it.
- Existing flag management, flag evaluation, audit-log, persistence, Docker, CI,
  and OpenAPI flows must remain unchanged except for required operational
  endpoint documentation.
- The implementation must preserve architecture boundaries: domain code must not
  depend on Express operational wiring, PostgreSQL readiness mechanics,
  Prometheus, OpenTelemetry, Kubernetes, Kong, or cloud infrastructure.
- OpenSpec artifacts must define liveness, readiness, and metrics behavior before
  implementation.
- The OpenAPI contract must be updated if these endpoints are treated as public
  or documented HTTP API surface.
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
- OpenAPI and runtime behavior can drift if operational endpoints are documented
  but not validated.

## Open questions

- Owner: Product/SRE. Should the existing `/health` endpoint remain a legacy
  process check, alias `/healthz`, or be documented separately from the new
  liveness/readiness split?
- Owner: Observability/Staff. Which initial HTTP metrics are required for the
  first implementation: request count, duration, status class, route label, or a
  smaller subset?
- Owner: SRE/QA. What exact non-success status and response body should
  `/readyz` return when PostgreSQL is unavailable?
- Owner: Product. Should `/metrics` be included in the public OpenAPI contract
  or documented only as an operational endpoint?

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/17
- OpenSpec change id requested by issue: `add-health-readiness-and-metrics`
- Relevant docs: `docs/adr/0006-use-level-1-local-platform-before-cloud.md`,
  `docs/adr/0013-use-opentelemetry-prometheus-and-grafana-for-observability.md`,
  `docs/adr/0014-use-github-actions-for-ci-and-quality-gates.md`,
  `docs/adr/0016-use-hexagonal-architecture-and-ddd-lite.md`,
  `docs/adr/0018-use-role-based-review-gates.md`,
  `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`
