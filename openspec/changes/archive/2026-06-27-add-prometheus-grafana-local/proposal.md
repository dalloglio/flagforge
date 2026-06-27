## Why

FlagForge needs a local metrics and dashboard path so contributors can practice observability operations around the existing Prometheus-compatible `/metrics` endpoint. This supports the accepted OpenTelemetry, Prometheus, and Grafana direction while staying local-first and vendor-neutral.

## What Changes

- Add local Docker Compose Prometheus configuration for scraping FlagForge metrics.
- Add local Docker Compose Grafana setup with source-controlled datasource and basic dashboard provisioning.
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
- Dependency impact: Prometheus and Grafana become optional Docker Compose local platform services for this increment; kind/Kubernetes observability remains a later change.
