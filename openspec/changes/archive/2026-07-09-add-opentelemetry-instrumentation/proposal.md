## Why

FlagForge has local Prometheus metrics and Grafana dashboards, but the API runtime does not yet expose vendor-neutral OpenTelemetry instrumentation. Adding a scoped instrumentation layer now gives contributors a production-style observability foundation without coupling feature flag domain logic to telemetry libraries, collectors, cloud infrastructure, or vendors.

## What Changes

- Add configurable OpenTelemetry instrumentation for the API runtime.
- Support local development configuration that can enable instrumentation when an export path is configured and leave it inert or disabled otherwise.
- Record safe, low-cardinality HTTP runtime telemetry without including request bodies, raw URLs, query strings, feature flag context values, credentials, database URLs, API keys, or other secrets.
- Document how contributors configure, enable, disable, validate, and troubleshoot the instrumentation locally.
- Preserve existing API behavior, feature flag behavior, evaluation behavior, audit-log behavior, PostgreSQL persistence behavior, health/readiness behavior, Prometheus metrics behavior, tests, and OpenAPI behavior.
- Keep OpenTelemetry, Express instrumentation, Prometheus, Grafana, collector, Kubernetes, cloud, and vendor dependencies out of domain modules.

## Capabilities

### New Capabilities

- `opentelemetry-instrumentation`: Defines configurable vendor-neutral OpenTelemetry instrumentation for the FlagForge API runtime, including local validation, data-safety constraints, and architecture boundaries.

### Modified Capabilities

- None.

## Impact

- Affected runtime areas: API/server startup wiring, configuration loading, and infrastructure-oriented telemetry setup.
- Affected tests: focused coverage for enable/disable behavior, safe HTTP telemetry attributes, and boundary protection against domain telemetry imports.
- Affected documentation: local development or operational documentation for OpenTelemetry configuration, validation, and troubleshooting.
- Affected dependencies: OpenTelemetry SDK and instrumentation packages may be added for API runtime instrumentation.
- Public API impact: none expected; `docs/api/openapi.yaml` should remain unchanged unless implementation introduces an explicit public API contract change.
