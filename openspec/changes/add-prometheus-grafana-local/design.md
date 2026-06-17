## Context

FlagForge already exposes Prometheus-compatible operational metrics through `/metrics`. ADR 0013 selects OpenTelemetry as the instrumentation direction and Prometheus plus Grafana for local metrics and visualization. This change adds the local scrape and dashboard layer around existing metrics without changing the application metrics contract.

The implementation should remain vendor-neutral and local-first.

## Goals / Non-Goals

**Goals:**

- Add local Prometheus configuration that scrapes the FlagForge metrics endpoint.
- Add local Grafana setup with a basic dashboard or provisioning path for FlagForge metrics.
- Document how to run, inspect, and validate the local observability stack.
- Keep validation explicit and outside the host-only application verification gate.

**Non-Goals:**

- OpenTelemetry tracing or Collector deployment.
- Alerting rules.
- Datadog or vendor-specific monitoring.
- AWS/EKS observability.
- Changes to the existing `/metrics` contract unless a later implementation change explicitly updates the health/readiness/metrics spec.

## Decisions

### Consume existing `/metrics` rather than adding new instrumentation in this change

The local Prometheus configuration will scrape the existing FlagForge metrics endpoint. The change does not require new API metrics behavior unless implementation discovers a documented gap that needs its own OpenSpec update.

Alternative considered: expand application instrumentation at the same time. That would mix platform observability setup with API behavior changes and make review harder.

### Provide Grafana through local provisioning or documented import

The implementation may use Grafana provisioning files or a documented dashboard import path, but the dashboard definition should be source controlled if practical. This makes the local dashboard repeatable while keeping production dashboard hardening out of scope.

Alternative considered: rely only on manual dashboard creation. That is useful for exploration but does not satisfy reproducible local practice.

### Keep observability stack validation separate from `npm run verify`

Prometheus/Grafana validation requires running services and should remain an explicit platform workflow. The standard verification gate stays focused on source, tests, OpenAPI, and OpenSpec validation.

Alternative considered: require Prometheus and Grafana in `npm run verify`. That would make application verification dependent on optional local services.

## Risks / Trade-offs

- [Risk] Prometheus scrape targets differ between Docker Compose and Kubernetes-local workflows. -> Mitigation: document the selected local topology and expected scrape target clearly.
- [Risk] Dashboards can imply production SLO coverage. -> Mitigation: label the dashboard as basic local observability, not production monitoring.
- [Risk] Metrics names can change if application instrumentation changes later. -> Mitigation: base dashboards on currently documented metrics and validate them locally.
- [Risk] Local observability services can conflict on host ports. -> Mitigation: document defaults and override/reset guidance.

## Migration Plan

No data or API migration is required. Add local Prometheus/Grafana configuration and documentation, validate that Prometheus scrapes FlagForge and Grafana can visualize the dashboard, and remove local services through documented cleanup when needed.

## Open Questions

- Should the first implementation run Prometheus/Grafana through Docker Compose, kind, or both?
- Which specific existing FlagForge metrics should the first dashboard visualize beyond basic request volume and duration?
