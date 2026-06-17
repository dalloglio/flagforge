## Why

FlagForge needs a local metrics and dashboard path so contributors can practice observability operations around the existing Prometheus-compatible `/metrics` endpoint. This supports the accepted OpenTelemetry, Prometheus, and Grafana direction while staying local-first and vendor-neutral.

## What Changes

- Add local Prometheus configuration for scraping FlagForge metrics.
- Add local Grafana setup with a basic FlagForge dashboard or dashboard provisioning path.
- Document how to run, inspect, and validate the local observability stack.
- Keep the setup compatible with the existing `/metrics` endpoint and low-cardinality metric requirements.
- Keep OpenTelemetry tracing, OpenTelemetry Collector, alerting rules, Datadog, AWS/EKS observability, and production dashboard hardening out of scope.

## Capabilities

### New Capabilities

- `local-prometheus-grafana`: Requirements for running a local Prometheus and Grafana stack that scrapes and visualizes FlagForge operational metrics.

### Modified Capabilities

- None.

## Impact

- Affected systems: local observability configuration, Grafana provisioning or dashboard documentation, Prometheus scrape configuration, and local validation docs.
- Affected existing capabilities: the stack should consume existing health/readiness/metrics behavior without changing metric contracts in this change.
- API impact: no public FlagForge API contract changes are expected.
- Dependency impact: Prometheus and Grafana become optional local platform services, likely through Docker Compose or Kubernetes-local tooling selected during implementation.
