## 1. Chart Structure

- [x] 1.1 Create the FlagForge API Helm chart directory with `Chart.yaml`, default `values.yaml`, local `values-local.yaml`, and template helpers.
- [x] 1.2 Add templates for the API Deployment, Service, and runtime configuration resources needed by the workload.
- [x] 1.3 Ensure rendered resources use stable names and labels based on Helm release/chart conventions.

## 2. Runtime Configuration

- [x] 2.1 Expose values for image repository, image tag, pull policy, replica count, container port, service port, and service type.
- [x] 2.2 Render `PORT` into the workload environment from the configured container port, and keep the container port, Service target port, liveness probe port, and readiness probe port aligned.
- [x] 2.3 Expose values for `DATABASE_URL`, `ADMIN_API_KEY`, `ADMIN_RATE_LIMIT_REQUESTS`, and `ADMIN_RATE_LIMIT_WINDOW_MS`.
- [x] 2.4 Render sensitive local runtime values through Kubernetes Secret data when chart-managed values are used.
- [x] 2.5 Support an existing Secret reference for sensitive runtime values without rendering a duplicate chart-managed Secret.
- [x] 2.6 Configure default liveness and readiness probes for `/healthz` and `/readyz` with configurable paths and timing settings.

## 3. Local Values And Documentation

- [x] 3.1 Provide local values suitable for the Level 1 kind path without adding Argo CD, Kong, PostgreSQL, observability, or AWS/EKS resources.
- [x] 3.2 Update README documentation with the chart path, local values file, Helm lint command, and Helm template command.
- [x] 3.3 Update the local development runbook with Helm prerequisites, local render/lint validation, probe defaults, and the relationship to host-only `npm run verify`.

## 4. Validation

- [x] 4.1 Run `helm lint` against the chart with default and local values when Helm is available.
- [x] 4.2 Run `helm template` against the chart with default and local values and confirm the rendered manifests include the API workload, Service, runtime environment, aligned `PORT`/container/probe ports, Secret handling, and probes.
- [x] 4.3 Run strict OpenSpec validation for `add-helm-chart`.
- [x] 4.4 Run `npm run verify` or report any environment/tooling blocker if verification cannot complete.
