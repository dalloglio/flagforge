## 1. Dependencies and Configuration

- [x] 1.1 Add the minimal OpenTelemetry SDK, exporter, and HTTP/Express instrumentation dependencies needed for Node.js API runtime tracing.
- [x] 1.2 Add telemetry configuration parsing with explicit enable/disable behavior and a documented local export mode.
- [x] 1.3 Add focused tests for telemetry configuration defaults, explicit disablement, enabled local configuration, and unsupported or incomplete export configuration.

## 2. Runtime Instrumentation

- [x] 2.1 Create an infrastructure-oriented telemetry module that owns OpenTelemetry SDK startup, HTTP/Express instrumentation registration, exporter setup, and shutdown.
- [x] 2.2 Wire telemetry initialization into `src/server.ts` before the Express app starts serving requests.
- [x] 2.3 Wire telemetry shutdown into server close and startup failure paths, including failures after telemetry initialization but before `app.listen`, without changing PostgreSQL pool shutdown behavior.
- [x] 2.4 Ensure disabled or inert telemetry configuration does not initialize exporters or change existing API request and response behavior.

## 3. Signal Safety and Boundaries

- [x] 3.1 Configure HTTP span attributes, including default instrumentation attributes, to use safe low-cardinality route, method, status, and service metadata.
- [x] 3.2 Add tests proving emitted HTTP telemetry does not include raw URLs, query strings, path parameter values, request bodies, feature flag context values, API keys, database URLs, credentials, or secret values from custom or default instrumentation attributes.
- [x] 3.3 Add an automated boundary check that fails if `src/domain/`, `src/application/`, or API route/use-case modules under `src/api/` import OpenTelemetry packages, instrumentation packages, Prometheus, Grafana, collector configuration, Kubernetes, cloud infrastructure, or vendor telemetry SDKs. Allow telemetry imports only in the dedicated infrastructure telemetry module and startup wiring.
- [x] 3.4 Confirm existing Prometheus `/metrics`, health/readiness, feature flag, evaluation, audit-log, admin authentication, and rate-limit tests remain unchanged in behavior.

## 4. Documentation

- [x] 4.1 Update local development documentation with supported OpenTelemetry configuration values, including enable, disable, and local validation export mode.
- [x] 4.2 Document how to generate local API traffic and confirm OpenTelemetry HTTP runtime signals without running an OpenTelemetry Collector, Datadog, AWS, EKS, Kubernetes, or a production tracing backend.
- [x] 4.3 Add troubleshooting guidance for missing signals, disabled instrumentation, unsupported export configuration, startup issues, and out-of-scope collector or vendor assumptions.
- [x] 4.4 Confirm `docs/api/openapi.yaml` remains unchanged unless implementation introduces an explicit public API behavior change.

## 5. Verification

- [x] 5.1 Run focused tests for telemetry configuration, runtime instrumentation, signal safety, and domain boundary constraints.
- [x] 5.2 Run `npm run verify`.
- [x] 5.3 Record any manual local OpenTelemetry validation commands or results required because a collector or backend remains out of scope.
