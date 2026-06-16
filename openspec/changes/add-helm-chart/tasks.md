## 1. Chart Structure

- [ ] 1.1 Create the FlagForge API Helm chart directory with `Chart.yaml`, default `values.yaml`, local `values-local.yaml`, and template helpers.
- [ ] 1.2 Add templates for the API Deployment, Service, and runtime configuration resources needed by the workload.
- [ ] 1.3 Ensure rendered resources use stable names and labels based on Helm release/chart conventions.

## 2. Runtime Configuration

- [ ] 2.1 Expose values for image repository, image tag, pull policy, replica count, container port, service port, and service type.
- [ ] 2.2 Expose values for `DATABASE_URL`, `ADMIN_API_KEY`, `ADMIN_RATE_LIMIT_REQUESTS`, and `ADMIN_RATE_LIMIT_WINDOW_MS`.
- [ ] 2.3 Render sensitive local runtime values through Kubernetes Secret data when chart-managed values are used.
- [ ] 2.4 Configure default liveness and readiness probes for `/healthz` and `/readyz` with configurable paths and timing settings.

## 3. Local Values And Documentation

- [ ] 3.1 Provide local values suitable for the Level 1 kind path without adding Argo CD, Kong, PostgreSQL, observability, or AWS/EKS resources.
- [ ] 3.2 Update README documentation with the chart path, local values file, Helm lint command, and Helm template command.
- [ ] 3.3 Update the local development runbook with Helm prerequisites, local render/lint validation, probe defaults, and the relationship to host-only `npm run verify`.

## 4. Validation

- [ ] 4.1 Run `helm lint` against the chart with default and local values when Helm is available.
- [ ] 4.2 Run `helm template` against the chart with default and local values and confirm the rendered manifests include the API workload, Service, runtime environment, and probes.
- [ ] 4.3 Run strict OpenSpec validation for `add-helm-chart`.
- [ ] 4.4 Run `npm run verify` or report any environment/tooling blocker if verification cannot complete.
