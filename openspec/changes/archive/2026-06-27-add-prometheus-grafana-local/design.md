## Context

FlagForge already exposes Prometheus-compatible operational metrics through `/metrics`. ADR 0013 selects OpenTelemetry as the instrumentation direction and Prometheus plus Grafana for local metrics and visualization. This change adds the Docker Compose local scrape and dashboard layer around existing metrics without changing the application metrics contract.

The implementation should remain vendor-neutral and local-first.

## Goals / Non-Goals

**Goals:**

- Add local Docker Compose Prometheus configuration that scrapes the FlagForge metrics endpoint.
- Add local Docker Compose Grafana setup with source-controlled datasource and basic dashboard provisioning for FlagForge metrics.
- Document how to run, inspect, and validate the local observability stack.
- Keep validation explicit and outside the host-only application verification gate.

**Non-Goals:**

- OpenTelemetry tracing or Collector deployment.
- Alerting rules.
- Datadog or vendor-specific monitoring.
- AWS/EKS observability.
- Changes to the existing `/metrics` contract. Any new metric names, labels, or instrumentation behavior require a separate or explicitly expanded health/readiness/metrics change.

## Decisions

### Use Docker Compose for the first local observability topology

The first implementation will run Prometheus and Grafana through Docker Compose alongside the existing local FlagForge stack. Prometheus scrape targets and Grafana provisioning differ enough between Compose and kind that this change should implement one topology clearly before adding Kubernetes-local observability.

Alternative considered: implement Docker Compose and kind together. That would broaden the change into Kubernetes platform wiring and make scrape target, service discovery, and dashboard provisioning review less focused.

### Consume existing `/metrics` rather than adding new instrumentation in this change

The local Prometheus configuration will scrape the existing FlagForge metrics endpoint. The change must not add or rename metrics, change metric labels, or otherwise alter application metrics behavior.

Alternative considered: expand application instrumentation at the same time. That would mix platform observability setup with API behavior changes and make review harder.

### Provide Grafana through source-controlled local provisioning

The implementation will source-control Grafana datasource and dashboard provisioning files for the basic local dashboard. This makes the local dashboard repeatable while keeping production dashboard hardening out of scope.

Alternative considered: rely only on manual dashboard creation. That is useful for exploration but does not satisfy reproducible local practice.

### Keep observability stack validation separate from `npm run verify`

Prometheus/Grafana validation requires running services and should remain an explicit platform workflow. The standard verification gate stays focused on source, tests, OpenAPI, and OpenSpec validation.

Alternative considered: require Prometheus and Grafana in `npm run verify`. That would make application verification dependent on optional local services.

## Risks / Trade-offs

- [Risk] Prometheus scrape targets differ between Docker Compose and Kubernetes-local workflows. -> Mitigation: implement only the Docker Compose topology in this change and document the expected scrape target clearly.
- [Risk] Dashboards can imply production SLO coverage. -> Mitigation: label the dashboard as basic local observability, not production monitoring.
- [Risk] Metrics names can change if application instrumentation changes later. -> Mitigation: base dashboards on currently documented metrics and validate them locally.
- [Risk] Local observability services can conflict on host ports. -> Mitigation: document defaults and override/reset guidance.

## Migration Plan

No data or API migration is required. Add Docker Compose Prometheus/Grafana configuration and documentation, validate that Prometheus scrapes FlagForge and Grafana can visualize the dashboard, and remove local services through documented cleanup when needed.

## Open Questions

- Which specific existing FlagForge metrics should the first dashboard visualize beyond basic request volume and duration?
