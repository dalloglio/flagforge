## Context

FlagForge already has a production Docker image, Docker Compose workflows, PostgreSQL-backed runtime configuration, and operational endpoints for liveness, readiness, and metrics. ADR 0009 selects Helm for Kubernetes packaging, while ADR 0006 requires the project to mature a Level 1 local platform before cloud work and ADR 0010 keeps Argo CD configuration as a later step.

The chart must package only the API runtime for local Kubernetes usage. It should make the existing container runtime configurable without changing REST API behavior, domain logic, or persistence semantics.

## Goals / Non-Goals

**Goals:**

- Add a Helm chart under a conventional repository path such as `charts/flagforge-api`.
- Render Kubernetes manifests for the API runtime, including Deployment, Service, and optional ConfigMap/Secret resources for runtime configuration.
- Configure image repository/tag/pull policy, replica count, container/service ports, runtime environment variables, and health/readiness probes through values.
- Keep the API process `PORT`, container port, Service target port, and probe port aligned when the chart user customizes the container port.
- Provide local values that fit the Level 1 kind path and keep future cloud-specific values separate.
- Document Helm lint/render validation and local usage in README/runbook materials.

**Non-Goals:**

- Install or configure kind.
- Install or configure Argo CD.
- Deploy Kong, PostgreSQL, Prometheus, Grafana, or OpenTelemetry through this chart.
- Publish chart artifacts.
- Add AWS/EKS production values.
- Change API routes, OpenAPI behavior, persistence behavior, or application startup validation.

## Decisions

### Use one API chart with local values

The change will add a single API-focused chart and a local values file, for example `charts/flagforge-api/values-local.yaml`. This keeps Helm packaging scoped to the FlagForge API while leaving platform composition to later kind/Argo CD changes.

Alternatives considered:

- Add raw Kubernetes YAML first: rejected because ADR 0009 already selected Helm and values-driven packaging.
- Add a broader platform umbrella chart: rejected because PostgreSQL, Kong, Argo CD, and observability packaging are separate platform concerns and would expand this issue beyond the requested scope.

### Configure existing runtime environment through values

The chart will expose values for runtime environment required by the current app, including `PORT`, `DATABASE_URL`, `ADMIN_API_KEY`, `ADMIN_RATE_LIMIT_REQUESTS`, and `ADMIN_RATE_LIMIT_WINDOW_MS`. `PORT` must be rendered into the container environment from the configured container port so the Node.js process listens on the same port used by the container, Service target port, and probes. Sensitive and connection-string values should render through Kubernetes Secret data when the chart owns them locally, while non-sensitive tuning can render through ConfigMap data or direct environment entries.

Alternatives considered:

- Hard-code local development values in templates: rejected because it blocks parallel local setups and future environment separation.
- Require only externally managed Secrets in the first chart: rejected because local Level 1 usage needs a straightforward path, but the chart can still support existing Secret references.
- Make only the Kubernetes Service port configurable: rejected because the chart should remain values-driven for common local Kubernetes port conventions, as long as the API process `PORT` is kept in sync.

### Support chart-managed and existing Secrets

The chart will support a chart-managed local Secret for first-run Level 1 usage and an existing Secret reference for workflows that manage sensitive values outside the chart. A values shape such as `secret.create`, `secret.existingSecret`, and explicit key names is acceptable as long as it is documented and renderable without Argo CD or a running cluster.

Alternatives considered:

- Always create a Secret: rejected because future GitOps workflows may want Secret ownership outside this API chart.
- Require an existing Secret only: rejected because local Level 1 usage should remain straightforward before the wider platform automation exists.
- Store sensitive values only in ConfigMaps or direct environment entries: rejected because `DATABASE_URL` and `ADMIN_API_KEY` should not be modeled as non-sensitive runtime configuration.

### Use implemented operational endpoints for probes

Kubernetes liveness should target `GET /healthz`, and readiness should target `GET /readyz`. These endpoints already express process liveness and PostgreSQL dependency readiness, so the chart should not invent new health semantics.

Alternatives considered:

- Use legacy `GET /health` for all probes: rejected because `/healthz` and `/readyz` are the current Kubernetes-style operational endpoints.
- Disable probes by default: rejected because operational defaults should be useful for local platform validation.

### Keep Helm validation explicit and outside host-only verify

The repository should document or add explicit Helm validation commands such as `helm lint` and `helm template`. These checks may require the Helm CLI, so they should remain separate from `npm run verify`, which is specified as host-only and independent of Docker, PostgreSQL, or external services.

Alternatives considered:

- Add Helm validation to `npm run verify`: rejected because it would add a platform-tool dependency to the local completion gate.
- Skip validation commands: rejected because chart changes need a repeatable render/lint path.

## Risks / Trade-offs

- [Risk] Local chart values could accidentally imply production readiness. -> Mitigation: name and document the local values as Level 1 local platform inputs and exclude AWS/EKS production values.
- [Risk] Configurable ports could drift between Kubernetes resources and the Node.js process. -> Mitigation: derive the container `PORT` environment variable from the configured container port and validate rendered Service/probe targets.
- [Risk] Secret handling may be too rigid for future GitOps workflows. -> Mitigation: support values-driven local Secrets and existing Secret references in the first implementation.
- [Risk] Probe paths or ports could drift from the API. -> Mitigation: use the current `/healthz` and `/readyz` endpoints and make probe paths configurable with documented defaults.
- [Risk] Helm validation may not run on machines without Helm installed. -> Mitigation: keep Helm checks explicit and document Helm as a prerequisite for chart validation.
