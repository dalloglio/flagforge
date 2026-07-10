## Context

FlagForge already exposes Prometheus-compatible operational metrics at `GET /metrics` and has local Prometheus and Grafana documentation. ADR 0013 selects OpenTelemetry as the vendor-neutral instrumentation direction, and ADR 0016 requires domain code to remain independent from OpenTelemetry, Express, Prometheus, Grafana, Kubernetes, cloud, and vendor concerns.

This change adds scoped OpenTelemetry instrumentation for the Node.js/Express API runtime only. The initial implementation should be useful for local validation and future collector work, while preserving existing HTTP behavior and keeping the current Prometheus endpoint unchanged.

## Goals / Non-Goals

**Goals:**

- Provide a configurable OpenTelemetry bootstrap path for the API runtime.
- Capture safe HTTP server spans with low-cardinality route, method, and status information.
- Keep instrumentation inert or disabled unless local configuration enables an export path.
- Keep telemetry imports out of `src/domain/` and feature flag domain logic.
- Document local enable, disable, validation, and troubleshooting workflows.
- Cover enable/disable behavior, signal safety, and architectural boundaries with focused automated checks where practical.

**Non-Goals:**

- OpenTelemetry Collector deployment.
- Datadog, AWS, EKS, Kubernetes, or production tracing backend integration.
- Grafana dashboard, Prometheus scrape, alerting, or `/metrics` changes.
- OpenTelemetry metrics or custom domain spans in the first increment.
- Public API contract changes.
- Feature flag, evaluation, audit-log, PostgreSQL persistence, health/readiness, admin auth, or rate-limit behavior changes.

## Decisions

### Isolate OpenTelemetry in runtime infrastructure

Add OpenTelemetry setup in an infrastructure-oriented runtime module, such as `src/infrastructure/telemetry/`, and call it from `src/server.ts` before the Express app starts serving requests. The module should own OpenTelemetry SDK imports, exporter setup, instrumentation registration, and shutdown behavior.

Rationale: this keeps SDK mechanics out of `src/domain/`, preserves the existing API/application/domain boundaries, and makes startup/shutdown behavior testable without changing route handlers.

Alternative considered: add tracing calls inside application or domain use cases. This would make feature flag behavior depend on observability libraries and violates the accepted architecture boundary.

### Use configuration-gated SDK startup

Introduce explicit telemetry configuration parsing for local development. Instrumentation should be disabled by default, enabled only when configured, and inert when no supported export path is configured. A local console exporter is acceptable for validation because this change intentionally excludes a collector or tracing backend.

Rationale: default-off behavior prevents surprise startup failures in existing tests and local workflows, while a console validation path gives contributors a concrete way to prove spans are being produced without adding infrastructure that is out of scope.

Alternative considered: always start OpenTelemetry with default OTLP environment variables. That would make local behavior depend on absent collector infrastructure and could introduce noisy connection failures.

### Start with HTTP runtime traces only

The first signal should be Express/HTTP runtime tracing around served API requests. Emitted span attributes must use low-cardinality values such as HTTP method, route template, status code, and service metadata. Raw URLs, query strings, path parameter values, request bodies, feature flag context values, database URLs, API keys, credentials, and secrets must not appear in emitted span attributes, including attributes created by default HTTP or Express instrumentation. Implementation should configure instrumentation hooks, attribute filtering, or equivalent controls so emitted spans are safe by construction rather than relying only on avoiding custom unsafe attributes.

Rationale: HTTP traces are the most useful vendor-neutral runtime signal for this stage and avoid dragging domain behavior into telemetry. Existing Prometheus metrics continue to cover local request counts, durations, and process metrics.

Alternative considered: add OpenTelemetry metrics and custom spans around feature flag use cases. That adds complexity and higher data-safety risk before the project has a collector, backend, or reviewed signal model for domain-level spans.

### Preserve existing operational behavior

This change must not add, remove, rename, authenticate, rate-limit, or change responses for existing routes. `GET /metrics` remains Prometheus-compatible and outside the public OpenAPI contract. Health and readiness startup semantics remain unchanged, including PostgreSQL startup validation.

Rationale: OpenTelemetry is instrumentation, not a product API or operational endpoint behavior change.

Alternative considered: expose a new trace inspection endpoint. That would create public behavior and API contract work that the PRD explicitly does not need.

## Risks / Trade-offs

- Sensitive or high-cardinality telemetry attributes could leak user input or secrets -> limit all emitted attributes, including default instrumentation attributes, to safe HTTP route/method/status/service metadata and add tests or documented checks for unsafe values.
- Auto-instrumentation could affect startup order or tests -> gate setup behind explicit config and keep test defaults disabled.
- Console exporter validation is less production-like than a collector -> accept this as the local-first validation path until a separate collector change exists.
- Express route labels can be unavailable for unmatched or malformed requests -> use stable fallback labels rather than raw request URLs.
- Dependency churn from OpenTelemetry packages can increase maintenance surface -> add only the SDK/instrumentation packages needed for the initial HTTP tracing scope.

## Migration Plan

1. Add telemetry dependencies and a runtime telemetry module.
2. Add configuration parsing for enable/disable and local export mode.
3. Initialize telemetry before Express starts serving and shut it down when the process closes or when startup fails after telemetry has been initialized.
4. Add focused automated tests for configuration, disabled startup behavior, safe HTTP span attributes, and domain import boundaries.
5. Update local development documentation with enable, disable, validation, and troubleshooting steps.
6. Run `npm run verify`.

Rollback is to disable telemetry configuration or revert the runtime telemetry module and dependencies. Because the change has no public API or persistence migration, rollback does not require data migration.

## Open Questions

- Exact environment variable names should be chosen during implementation and documented alongside the local workflow.
- The local validation mechanism should prefer a deterministic test exporter for automated tests and a console exporter for manual contributor validation unless implementation reveals a simpler equivalent.
