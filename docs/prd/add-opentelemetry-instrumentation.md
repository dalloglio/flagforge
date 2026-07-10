# PRD: add-opentelemetry-instrumentation

## Problem

FlagForge has a local metrics foundation with Prometheus and Grafana, but the API
runtime still lacks vendor-neutral OpenTelemetry instrumentation. As the project
moves toward more production-like platform practice, contributors need a clear
way to observe API runtime behavior without coupling feature flag domain logic to
telemetry libraries or a specific vendor backend.

Without scoped instrumentation, future local platform, gateway, and cloud
observability work will either depend only on coarse Prometheus metrics or risk
adding ad hoc tracing and measurement concerns across application and domain
code.

## Goals

- Add configurable OpenTelemetry instrumentation for FlagForge API runtime
  operations.
- Preserve architecture boundaries so domain code remains independent from
  OpenTelemetry, Express instrumentation mechanics, Prometheus, Grafana,
  collectors, vendors, Kubernetes, and cloud infrastructure.
- Support local-first validation of instrumentation behavior.
- Keep existing API behavior, feature flag evaluation, audit-log behavior,
  persistence behavior, health/readiness behavior, metrics behavior, tests, and
  OpenAPI behavior stable unless an OpenSpec change explicitly expands scope.
- Document how to configure, enable, disable, and validate instrumentation
  locally.
- Keep the instrumentation direction aligned with the accepted OpenTelemetry,
  Prometheus, and Grafana observability decision.

## Non-goals

- Full OpenTelemetry Collector deployment.
- Datadog or other vendor-specific integration.
- Production tracing backend.
- Grafana dashboard changes.
- Prometheus scrape or dashboard provisioning changes.
- Alerting rules.
- AWS, EKS, or production observability rollout.
- Changes to feature flag, evaluation, audit-log, PostgreSQL persistence, rate
  limiting, health/readiness, or public API behavior.
- Adding telemetry dependencies to domain modules.

## Users

- Developers validating FlagForge locally.
- Contributors adding platform and observability capabilities.
- Staff reviewers assessing architecture boundaries.
- QA reviewers checking regression risk and validation coverage.
- SRE and observability reviewers assessing signal usefulness and configuration
  clarity.
- Future local platform workflows that need vendor-neutral runtime
  instrumentation before collector, Kubernetes, or cloud observability work.

## Requirements

- The system must provide scoped OpenTelemetry instrumentation for the API
  runtime.
- Instrumentation must be configurable for local development.
- Instrumentation must be possible to disable or leave inert when no local
  telemetry export path is configured.
- Instrumentation must not require Datadog, AWS, EKS, a production tracing
  backend, or a full OpenTelemetry Collector deployment.
- Instrumentation must preserve existing API request and response behavior.
- Instrumentation must preserve existing feature flag, evaluation, audit-log,
  PostgreSQL persistence, health/readiness, and metrics behavior.
- Domain code must not import or depend on OpenTelemetry packages, Express
  instrumentation packages, Prometheus, Grafana, collector configuration,
  Kubernetes, cloud infrastructure, or vendor telemetry SDKs.
- Telemetry signal names, attributes, and labels must avoid secrets, API keys,
  database URLs, request bodies, raw user context values, and other sensitive or
  high-cardinality input.
- HTTP instrumentation must use low-cardinality route and status information
  rather than raw request URLs or unbounded request input.
- Local documentation must explain the supported configuration, how to run the
  API with instrumentation enabled, how to validate that instrumentation is
  active, and how to troubleshoot missing signals.
- Validation must include automated tests or explicit documented checks where
  automation is not practical.
- OpenSpec artifacts must define the required instrumentation behavior before
  implementation.
- Any public API contract changes introduced by the OpenSpec change must be
  reflected in `docs/api/openapi.yaml`; no public API change is expected from
  this PRD as currently scoped.

## Risks

- Instrumentation can leak sensitive request data if attributes include raw
  context, bodies, credentials, or database connection details.
- Telemetry dependencies can bleed into domain modules if the runtime boundary is
  not kept explicit.
- Local validation can become brittle if it requires a collector or tracing
  backend before those are in scope.
- Auto-instrumentation can alter runtime behavior, startup order, logging, or
  test behavior if wiring is not isolated.
- OpenTelemetry signal choices can be too generic to help future SRE and
  observability review, or too detailed and high-cardinality for safe local
  practice.
- The GitHub issue references an OpenSpec change id that is not present in the
  current worktree, so implementation scope may drift if the change is created
  after this PRD without reconciling requirements.

## Resolved decisions

- OpenTelemetry is the vendor-neutral instrumentation direction for this work.
- Prometheus and Grafana remain the local metrics and visualization foundation.
- Datadog remains out of scope for this change.
- Domain code must remain independent from telemetry libraries.
- Full collector deployment, tracing backend setup, dashboards, alerting, and
  AWS/EKS observability remain future changes.
- This PRD expects no public API contract change unless the later OpenSpec change
  explicitly adds one.

## Open questions

- The GitHub issue requests OpenSpec change
  `add-opentelemetry-instrumentation`, but that active change is not present in
  this worktree. The OpenSpec proposal, design, specs, and tasks need to be
  created or restored before implementation.
- Which local validation path should the OpenSpec change require when no
  collector is in scope: console/exporter inspection, test exporter assertions,
  startup configuration checks, or another documented mechanism?
- Which initial signals are required for review: HTTP traces only, runtime
  metrics through OpenTelemetry, custom spans around API use cases, or a smaller
  first increment limited to safe auto-instrumentation?

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/30
- OpenSpec change id requested by issue: `add-opentelemetry-instrumentation`
- Relevant docs: `docs/adr/0013-use-opentelemetry-prometheus-and-grafana-for-observability.md`,
  `docs/adr/0016-use-hexagonal-architecture-and-ddd-lite.md`,
  `docs/context/architecture.md`, `docs/context/delivery-workflow.md`, and
  `docs/prd/add-health-readiness-and-metrics.md`
