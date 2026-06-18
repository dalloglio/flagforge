# Local Development Runbook

## Environment

Use one root `.env` file for non-secret Docker-backed local defaults. Start from `.env.example`:

```bash
COMPOSE_PROJECT_NAME=flagforge
PORT=3000
ADMIN_API_KEY=dev-admin-api-key
ADMIN_RATE_LIMIT_REQUESTS=60
ADMIN_RATE_LIMIT_WINDOW_MS=60000
KONG_PROXY_PORT=8000
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
DATABASE_PORT=5432
DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
TEST_DATABASE_PORT=5433
TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5433/flagforge_test
```

`COMPOSE_PROJECT_NAME` is read by Docker Compose on the host to isolate project resources such as containers, networks, and volumes. It is not a container runtime setting.

`ADMIN_API_KEY` is required when starting the API outside tests. Use a non-secret local value such as `dev-admin-api-key`; protected admin endpoints accept it only through the `X-Admin-API-Key` request header. `ADMIN_RATE_LIMIT_REQUESTS` and `ADMIN_RATE_LIMIT_WINDOW_MS` configure the local in-process fixed-window admin API rate limit. The defaults allow 60 protected admin requests per 60,000 milliseconds for the authenticated admin identity. `DATABASE_URL` is used by the API runtime and `npm run db:migrate`. `TEST_DATABASE_URL` is used only by PostgreSQL integration tests. Those tests are destructive for the configured test database and never fall back to `DATABASE_URL`, even though the `TEST_` values live in the same local `.env` file.

Keep `DATABASE_URL` and `TEST_DATABASE_URL` explicit. If you change `DATABASE_PORT` or `TEST_DATABASE_PORT`, update the matching URL port as well; local dotenv loading does not compose URL values from other variables.

For parallel worktrees, use distinct Compose project names and host ports in each worktree's `.env`:

```bash
COMPOSE_PROJECT_NAME=flagforge-exp-17
PORT=3017
ADMIN_API_KEY=dev-admin-api-key
ADMIN_RATE_LIMIT_REQUESTS=60
ADMIN_RATE_LIMIT_WINDOW_MS=60000
KONG_PROXY_PORT=8017
PROMETHEUS_PORT=9117
GRAFANA_PORT=3017
DATABASE_PORT=5417
DATABASE_URL=postgres://flagforge:flagforge@localhost:5417/flagforge
TEST_DATABASE_PORT=54317
TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:54317/flagforge_test
```

## Local Workflow

Install dependencies:

```bash
npm install
```

Start the development PostgreSQL service:

```bash
docker compose up -d postgres
```

Apply migrations explicitly before starting the API or Compose app service:

```bash
npm run db:migrate
```

Start the API on the host:

```bash
npm run dev
```

Call protected endpoints with the local admin key:

```bash
curl --fail -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:${PORT:-3000}/flags
```

Validate local admin rate limiting with a short window:

```bash
ADMIN_RATE_LIMIT_REQUESTS=1 ADMIN_RATE_LIMIT_WINDOW_MS=5000 npm run dev
curl -i -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:${PORT:-3000}/flags
curl -i -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:${PORT:-3000}/flags
sleep 5
curl -i -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:${PORT:-3000}/flags
```

The first protected request is allowed, the second returns HTTP `429` with the standard error body and a `Retry-After` header, and the final request succeeds after the fixed window resets. Missing or invalid `X-Admin-API-Key` values still return HTTP `401` before rate-limit accounting. `/health`, `/healthz`, `/readyz`, and `/metrics` do not require or consume admin rate-limit budget.

Run checks:

```bash
npm test
docker compose up -d postgres-test
npm run test:postgres
npm run build
npm run verify
```

`npm run verify` is host-only and does not require Docker or PostgreSQL. It includes OpenAPI validation. Run PostgreSQL integration tests separately when a database is available. Gateway-dependent admin rate-limit validation remains a smoke check outside `npm run verify` when it requires Docker, Kong, or running services.

## Local Helm Packaging

Helm chart validation requires the Helm CLI. It does not require Argo CD, Kong, AWS, EKS, or a running Kubernetes cluster.

The API chart lives at `charts/flagforge-api`. Use `charts/flagforge-api/values-local.yaml` for the Level 1 local platform path. The local values keep the scope to the API workload and non-secret development configuration; they do not install PostgreSQL, Kong, observability, Argo CD, or cloud infrastructure.

Lint the chart with default and local values:

```bash
helm lint charts/flagforge-api
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
```

Render manifests with default and local values:

```bash
helm template flagforge-api charts/flagforge-api
helm template flagforge-api charts/flagforge-api -f charts/flagforge-api/values-local.yaml
```

The chart renders the API Deployment, Service, runtime ConfigMap, and chart-managed Secret by default. `PORT` is derived from `containerPort`, so the Node.js process port, container port, Service target port, liveness probe port, and readiness probe port stay aligned. Liveness defaults to `GET /healthz`; readiness defaults to `GET /readyz`. Probe paths and timing settings are configurable in values.

Sensitive runtime values use a chart-managed Secret by default for local use. To use an externally managed Secret, set `secret.existingSecret` and keep `secret.keys.databaseUrl` and `secret.keys.adminApiKey` aligned with that Secret's keys; the chart will reference the existing Secret and skip rendering its own Secret.

Helm lint/template checks are explicit platform packaging checks. They remain outside `npm run verify`, which is the host-only completion gate.

## Local kind Kubernetes

kind is a Level 1 local simulation environment for practicing the FlagForge Kubernetes path. It is not production Kubernetes, AWS, or EKS, and a passing kind smoke check does not prove production Kubernetes readiness.

The source-controlled kind cluster configuration lives at `infra/kind/cluster.yaml`. The default local cluster name is `flagforge-local`. Override it for parallel worktrees by setting `KIND_CLUSTER`, for example `KIND_CLUSTER=flagforge-exp-17 make kind-create`. The namespace defaults to `flagforge` and can be overridden with `KIND_NAMESPACE`.

Prerequisites:

- Docker is installed and running.
- `kind`, `kubectl`, and Helm are installed.
- Node.js dependencies are installed with `npm install`.
- The local API image exists as `flagforge-api:local`.
- PostgreSQL is running inside kind and ready.
- Migrations have been applied before API readiness validation.

Create the cluster and prepare the namespace:

```bash
make kind-create
make kind-namespace
```

Build and load the API image into kind:

```bash
make docker-build
make kind-load-image
```

Start PostgreSQL inside the kind cluster with local-only credentials:

```bash
make kind-postgres
make kind-postgres-wait
```

The local PostgreSQL manifest lives at `infra/kind/postgres.yaml`. It is only for Level 1 local practice and uses non-secret development credentials: database `flagforge`, user `flagforge`, password `flagforge`, and service `postgres` inside the selected namespace.

Apply migrations from the host through a temporary PostgreSQL port-forward:

```bash
kubectl -n ${KIND_NAMESPACE:-flagforge} port-forward svc/postgres 15432:5432
DATABASE_URL=postgres://flagforge:flagforge@localhost:15432/flagforge npm run db:migrate
```

Run the `kubectl port-forward` command in one terminal and the migration command in another. Stop the port-forward after migrations succeed.

Deploy the API through the Helm chart:

```bash
make kind-helm-deploy
kubectl -n ${KIND_NAMESPACE:-flagforge} rollout status deploy/flagforge-api --timeout=120s
```

The kind workflow uses `charts/flagforge-api/values-local.yaml`. The API `DATABASE_URL` is rendered into the chart-managed local Secret as `postgres://flagforge:flagforge@postgres:5432/flagforge`, which targets the in-cluster PostgreSQL Service. `ADMIN_API_KEY` uses the non-secret local default `dev-admin-api-key`. For an externally created Secret, create it in the `flagforge` namespace and set `secret.existingSecret`, `secret.keys.databaseUrl`, and `secret.keys.adminApiKey` in a local values override.

Validate API reachability through a temporary Service port-forward:

```bash
make kind-api-port-forward
make kind-smoke-ready
```

Run the `kind-api-port-forward` target in one terminal and the smoke target in another. `kind-smoke-ready` calls `GET /readyz` through `http://localhost:${KIND_API_PORT:-3000}` and fails if the API is not reachable or not ready.

Reset the local cluster:

```bash
make kind-delete
make kind-create
```

To remove only the FlagForge namespace resources:

```bash
kubectl delete namespace ${KIND_NAMESPACE:-flagforge}
make kind-namespace
```

## Local Argo CD GitOps

The local Argo CD workflow is Level 1 local platform practice. It does not claim AWS, EKS, production promotion, production rollout, or production secret management support.

Prerequisites:

- A local Kubernetes cluster, preferably the existing kind path selected for local platform work.
- The API image expected by `charts/flagforge-api/values-local.yaml` available to the cluster, such as `flagforge-api:local` loaded into kind.
- PostgreSQL reachable from the API workload at the local value `postgres://flagforge:flagforge@postgres:5432/flagforge`, or an intentionally configured replacement Secret.
- `kubectl` pointed at the local cluster.
- Argo CD installed in the local cluster with either CLI access through `argocd` or UI access through a local port-forward.
- Helm chart validation completed with the local values file before relying on Argo CD reconciliation.

The source-controlled Application lives at `infra/argocd/flagforge-api-local-application.yaml`. It points Argo CD at the existing `charts/flagforge-api` Helm chart and `charts/flagforge-api/values-local.yaml`; it does not define Argo CD-specific raw Deployment, Service, ConfigMap, or Secret manifests for the API workload.

Prepare the local deployment inputs before sync:

```bash
docker build -t flagforge-api:local .
kind load docker-image flagforge-api:local
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
helm template flagforge-api charts/flagforge-api -f charts/flagforge-api/values-local.yaml
```

Apply the Application definition:

```bash
kubectl apply -f infra/argocd/flagforge-api-local-application.yaml
```

Sync through the Argo CD CLI:

```bash
argocd app get flagforge-api-local
argocd app sync flagforge-api-local
argocd app wait flagforge-api-local --sync --health --timeout 180
```

If using the UI, port-forward the Argo CD server and sync `flagforge-api-local` from the application page:

```bash
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

The expected healthy local state is `Synced` and `Healthy`. If sync fails, collect actionable details before changing desired state:

```bash
argocd app get flagforge-api-local
argocd app diff flagforge-api-local
kubectl -n flagforge get pods,svc
kubectl -n flagforge describe pods
```

Inspect drift and trigger resync after an intentional local change:

```bash
argocd app diff flagforge-api-local
argocd app sync flagforge-api-local
argocd app wait flagforge-api-local --sync --health --timeout 180
```

Validate the runtime endpoint after the application is synced and healthy:

```bash
kubectl -n flagforge port-forward svc/flagforge-api 3000:3000
curl --fail http://localhost:3000/healthz
curl -i http://localhost:3000/readyz
```

The committed Application uses `targetRevision: main` as the reusable mainline-safe desired state. To validate an unmerged feature branch or exact commit in a local Argo CD application, patch the local Application after the branch or SHA has been pushed:

```bash
argocd app set flagforge-api-local --revision feat/23/add-argocd-gitops
argocd app sync flagforge-api-local
argocd app wait flagforge-api-local --sync --health --timeout 180
```

Use a commit SHA in place of the branch name when validating an immutable revision. Do not commit branch-specific, worktree-specific, or personal target revisions to `infra/argocd/flagforge-api-local-application.yaml`.

Cleanup local GitOps state:

```bash
argocd app delete flagforge-api-local --cascade
kubectl delete -f infra/argocd/flagforge-api-local-application.yaml --ignore-not-found
kubectl delete namespace flagforge --ignore-not-found
```

The local values use non-secret development defaults such as `dev-admin-api-key`. Do not commit production secrets, personal credentials, cloud credentials, or copied cluster tokens. For local experiments that need different sensitive values, create a local Kubernetes Secret and point Helm values at it with `secret.existingSecret`; do not commit those values. This local-safe handling is not a production secret management strategy.

## API Contract

The canonical API contract is `docs/api/openapi.yaml`.

Validate the contract:

```bash
npm run openapi:validate
```

Preview the rendered contract:

```bash
npm run openapi:preview
```

The preview command writes `/tmp/flagforge-openapi.html`, which can be opened in a browser. Keep OpenSpec specs, tests, and `docs/api/openapi.yaml` aligned whenever API behavior changes.

The PostgreSQL integration harness loads `.env`, requires `TEST_DATABASE_URL`, applies migrations to `flagforge_test`, and truncates `audit_events` and `feature_flags` before each test.

## Docker Workflow

Build the production API image:

```bash
docker build -t flagforge-api:local .
```

Run the Compose app service after migrations have prepared the database:

```bash
docker compose up -d app
```

Smoke check the running API:

```bash
curl --fail http://localhost:${PORT:-3000}/health
```

Verify the operational endpoints:

```bash
curl --fail http://localhost:${PORT:-3000}/healthz
curl -i http://localhost:${PORT:-3000}/readyz
curl -i http://localhost:${PORT:-3000}/metrics
```

`/metrics` is a Prometheus-compatible operational scrape endpoint, not a product API route.
`/healthz` is observable only after the API process has completed startup and is serving HTTP requests. Startup PostgreSQL validation remains unchanged, so missing, invalid, or unavailable PostgreSQL configuration can still prevent the HTTP listener from starting.

The Compose app service does not run migrations automatically. Keep migrations as an explicit prerequisite with `npm run db:migrate` or `make db-migrate`.

## Local Kong Gateway

Kong runs locally through Docker Compose in DB-less mode using `infra/kong/kong.yml`. It routes host traffic from the Kong proxy to the Compose `app` service. Direct app access remains available through `${PORT:-3000}`.

Start the API and Kong gateway after migrations have prepared the database:

```bash
docker compose up -d postgres
npm run db:migrate
docker compose up -d app kong
```

Validate direct app access:

```bash
curl --fail http://localhost:${PORT:-3000}/health
```

Validate gateway access:

```bash
curl --fail http://localhost:${KONG_PROXY_PORT:-8000}/health
make smoke-gateway
```

Admin rate limiting is enforced by the application for both direct host access and proxied Kong traffic. To smoke check the gateway path, start the API with a low `ADMIN_RATE_LIMIT_REQUESTS` value, send repeated protected requests through `http://localhost:${KONG_PROXY_PORT:-8000}`, and verify the same HTTP `429` and `Retry-After` behavior observed through the direct app port.

Override the gateway host port by setting `KONG_PROXY_PORT` before starting Compose:

```bash
KONG_PROXY_PORT=8017 docker compose up -d kong
curl --fail http://localhost:8017/health
```

Kong Admin API ports are not published to the host by default. The local gateway workflow does not require host access to the Kong Admin API because Kong loads the checked-in declarative configuration at startup.

## Local Prometheus and Grafana

Prometheus and Grafana run locally through Docker Compose. Prometheus reads `infra/observability/prometheus/prometheus.yml` and scrapes the existing FlagForge `GET /metrics` endpoint at the Compose-network target `app:3000`. Grafana reads source-controlled provisioning from `infra/observability/grafana/provisioning` and loads the basic dashboard from `infra/observability/grafana/dashboards`.

Start the API, Prometheus, and Grafana after migrations have prepared the database:

```bash
docker compose up -d postgres
npm run db:migrate
docker compose up -d app prometheus grafana
```

The same workflow is available through the Makefile:

```bash
make observability-up
```

Prometheus is available at `http://localhost:${PROMETHEUS_PORT:-9090}`. Inspect target health at `http://localhost:${PROMETHEUS_PORT:-9090}/targets` and confirm the `flagforge-api` target is `UP`. The Prometheus scrape target is `app:3000` inside the Compose network, not the host `localhost` port.

Generate at least one request metric before validating dashboard panels:

```bash
curl --fail http://localhost:${PORT:-3000}/health
curl --fail http://localhost:${PORT:-3000}/metrics
```

Validate that Prometheus can query FlagForge metrics:

```bash
curl --fail "http://localhost:${PROMETHEUS_PORT:-9090}/api/v1/query?query=up%7Bjob%3D%22flagforge-api%22%7D"
curl --fail "http://localhost:${PROMETHEUS_PORT:-9090}/api/v1/query?query=http_requests_total"
make smoke-prometheus
```

Grafana is available at `http://localhost:${GRAFANA_PORT:-3001}`. Anonymous local viewer access is enabled for this Level 1 workflow. Open the `FlagForge / FlagForge Local Overview` dashboard and confirm the `FlagForge Prometheus` datasource is connected.

Validate Grafana service health:

```bash
curl --fail http://localhost:${GRAFANA_PORT:-3001}/api/health
make smoke-grafana
```

If the dashboard is empty, wait for Prometheus to scrape, send a few API requests, and refresh the dashboard. The dashboard visualizes existing `http_requests_total`, `http_request_duration_seconds_bucket`, and `process_resident_memory_bytes` metrics; this workflow does not add, rename, relabel, or otherwise change application instrumentation.

Stop the local observability services:

```bash
docker compose stop prometheus grafana
```

Reset local observability state, including Prometheus samples:

```bash
docker compose down
docker volume rm ${COMPOSE_PROJECT_NAME:-flagforge}_flagforge-prometheus-data
```

This is a Level 1 local observability practice path using Prometheus and Grafana only. It does not provide kind or Kubernetes observability, production SLOs, alerting, OpenTelemetry Collector coverage, AWS observability, EKS observability, Datadog, or vendor-managed monitoring.

## Makefile Shortcuts

```bash
make db-up
make db-test-up
make db-migrate
make test-unit
make test-postgres
make build
make docker-build
make compose-up
make observability-up
make smoke-health
make smoke-gateway
make kind-create
make kind-load-image
make kind-postgres
make kind-postgres-wait
make kind-helm-deploy
make kind-api-port-forward
make kind-smoke-ready
make kind-delete
make smoke-prometheus
make smoke-grafana
make verify
```

## Troubleshooting

If migrations cannot connect, confirm PostgreSQL is healthy with `docker compose ps postgres` and verify `DATABASE_URL` points at the host and port selected by `DATABASE_PORT` for host commands.

If PostgreSQL integration tests report that `TEST_DATABASE_URL` is required, confirm `.env` exists or export `TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5433/flagforge_test`.

If PostgreSQL integration tests fail to connect, confirm the test database is healthy with `docker compose ps postgres-test` and verify no other local service is using the host port selected by `TEST_DATABASE_PORT`.

If the Compose app cannot connect to PostgreSQL, confirm the app service uses the Compose-network hostname `postgres` in `DATABASE_URL`.

If `/health` fails, check `docker compose logs app postgres`, confirm migrations ran successfully, and verify the expected host port with `docker compose ps`.

If gateway `/health` fails but direct app `/health` works, check `docker compose ps kong`, inspect `docker compose logs kong`, and confirm `infra/kong/kong.yml` is mounted by recreating the service with `docker compose up -d --force-recreate kong`.

If the gateway host port is unavailable, set `KONG_PROXY_PORT` to an unused port and restart the Kong service. Keep the direct API `PORT` and gateway `KONG_PROXY_PORT` distinct in parallel worktrees.

If `kind` is missing, install the kind CLI and retry `make kind-create`. If Docker is not running, start Docker before creating or deleting clusters.

If cluster creation fails, check for an existing cluster with `kind get clusters`, use `make kind-delete` for the selected `KIND_CLUSTER`, or choose a unique `KIND_CLUSTER` for the worktree.

If `kubectl` cannot find the cluster, confirm `kind get clusters` lists the selected cluster and switch context with `kubectl config use-context kind-${KIND_CLUSTER:-flagforge-local}`.

If `helm` is missing, install Helm before running `make kind-helm-deploy`. Use `helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml` to isolate chart rendering problems before deploying.

If `make kind-load-image` fails, confirm `make docker-build` created `flagforge-api:local` and that the selected kind cluster exists.

If PostgreSQL readiness fails, inspect `kubectl -n ${KIND_NAMESPACE:-flagforge} get pods`, `kubectl -n ${KIND_NAMESPACE:-flagforge} describe statefulset/postgres`, and `kubectl -n ${KIND_NAMESPACE:-flagforge} logs statefulset/postgres`.

If migrations fail, confirm the PostgreSQL port-forward is still running, `DATABASE_URL` uses `localhost:15432`, and the PostgreSQL pod is ready.

If API readiness fails, inspect `kubectl -n ${KIND_NAMESPACE:-flagforge} get pods`, `kubectl -n ${KIND_NAMESPACE:-flagforge} logs deploy/flagforge-api`, confirm migrations completed, and confirm the chart Secret contains a `DATABASE_URL` that points to the in-cluster `postgres` Service.

If Prometheus reports the `flagforge-api` target as down, confirm `docker compose ps app prometheus`, check `docker compose logs app prometheus`, and verify `infra/observability/prometheus/prometheus.yml` still uses `metrics_path: /metrics` and target `app:3000`.

If Prometheus has no FlagForge metrics, call `curl --fail http://localhost:${PORT:-3000}/metrics`, generate API traffic, wait for the next scrape interval, and query `up{job="flagforge-api"}` and `http_requests_total` in Prometheus.

If Grafana cannot query Prometheus, check `docker compose ps grafana prometheus`, inspect `docker compose logs grafana`, and confirm the provisioned datasource URL is `http://prometheus:9090` inside the Compose network.

If the Grafana dashboard is missing, recreate Grafana with `docker compose up -d --force-recreate grafana`, check provisioning logs, and confirm `infra/observability/grafana/provisioning/dashboards/flagforge.yml` points at `/var/lib/grafana/dashboards`.

If Prometheus or Grafana host ports are unavailable, set `PROMETHEUS_PORT` or `GRAFANA_PORT` to unused ports and restart the services. Keep `PORT`, `KONG_PROXY_PORT`, `PROMETHEUS_PORT`, and `GRAFANA_PORT` distinct in parallel worktrees.

## Out of Scope

Local Kong and kind workflows do not add authentication, authorization, production hardening, Argo CD, cloud deployment, registry publishing, or observability. Local Prometheus and Grafana do not add production SLOs, alerting, OpenTelemetry Collector deployment, AWS observability, EKS observability, Datadog, or vendor-managed monitoring. Admin API rate limiting is currently local in-process application behavior, not distributed production quota enforcement.
