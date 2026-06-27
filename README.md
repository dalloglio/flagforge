# FlagForge

FlagForge is a small TypeScript/Express feature flag API used to practice OpenSpec-driven development, testing, delivery workflow design, and future platform engineering.

The current runtime persists feature flags and audit events in PostgreSQL, evaluates flags deterministically from request context, supports simple targeting rules and percentage rollouts, and exposes an audit log for successful flag mutations.

## Current Capabilities

- Create and update feature flags.
- Evaluate feature flags through an HTTP API.
- Validate external input with Zod.
- Apply deterministic percentage rollouts.
- Record and list durable audit events for flag mutations.
- Persist feature flags and audit events in PostgreSQL.
- Verify behavior with Vitest, Supertest, TypeScript, ESLint, Prettier, OpenAPI validation, and OpenSpec validation.

## Delivery Model

OpenSpec is the source of truth for behavior changes. Durable decisions live in `docs/adr/`, focused context lives in `docs/context/`, and reusable delivery assets live in `docs/templates/` and `docs/agent-playbooks/`.

## Commands

```bash
npm install
docker compose up -d postgres
npm run db:migrate
npm run dev
npm test
docker compose up -d postgres-test
npm run test:postgres
npm run build
docker build -t flagforge-api:local .
helm lint charts/flagforge-api
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
helm template flagforge-api charts/flagforge-api
helm template flagforge-api charts/flagforge-api -f charts/flagforge-api/values-local.yaml
docker compose up -d app
curl --fail http://localhost:3000/health
curl --fail -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:3000/flags
docker compose up -d kong
curl --fail http://localhost:8000/health
docker compose up -d app prometheus grafana
curl --fail http://localhost:9090/api/v1/targets
curl --fail http://localhost:3001/api/health
npm run openapi:validate
npm run openapi:preview
npm run verify
```

Use `npm run verify` before treating implementation work as complete. It runs host-only checks, including OpenAPI validation, and does not require Docker, Docker Compose, PostgreSQL, Prometheus, Grafana, Kubernetes, or running observability services. Run PostgreSQL integration, Docker build, Compose smoke checks, and observability smoke checks explicitly when those tools are available.

## Helm

The FlagForge API Helm chart lives at `charts/flagforge-api`. It packages only the API runtime for the Level 1 local platform path and does not install Argo CD, Kong, PostgreSQL, Prometheus, Grafana, OpenTelemetry, AWS, or EKS resources.

The local values file is `charts/flagforge-api/values-local.yaml`. It uses non-secret local defaults for the future kind path, including `DATABASE_URL=postgres://flagforge:flagforge@postgres:5432/flagforge` and `ADMIN_API_KEY=dev-admin-api-key`.

Validate the chart when the Helm CLI is available:

```bash
helm lint charts/flagforge-api
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
helm template flagforge-api charts/flagforge-api
helm template flagforge-api charts/flagforge-api -f charts/flagforge-api/values-local.yaml
```

The chart renders the API Deployment, Service, runtime ConfigMap, and chart-managed Secret by default. Set `secret.existingSecret` to reference externally managed `DATABASE_URL` and `ADMIN_API_KEY` values without rendering a duplicate Secret. Helm validation is an explicit platform packaging check and is not part of the host-only `npm run verify` gate.

## Local Argo CD

The local Argo CD desired-state entrypoint is `infra/argocd/flagforge-api-local-application.yaml`. It uses the existing Helm chart at `charts/flagforge-api`, the local values file, and `targetRevision: main` for reusable mainline desired state.

Apply and sync it only after local Kubernetes, Argo CD, the local API image, and Helm chart validation are ready:

```bash
kubectl apply -f infra/argocd/flagforge-api-local-application.yaml
argocd app sync flagforge-api-local
argocd app wait flagforge-api-local --sync --health --timeout 180
```

For feature-branch validation, patch the local Argo CD application target revision after pushing the branch or commit SHA instead of committing branch-specific revisions:

```bash
argocd app set flagforge-api-local --revision feat/23/add-argocd-gitops
```

Local GitOps sync, drift inspection, runtime endpoint validation, cleanup, and local-safe secret guidance are documented in `docs/runbooks/local-development.md`. This workflow remains outside `npm run verify` and is limited to Level 1 local platform practice.

## API Contract

The canonical OpenAPI contract lives at `docs/api/openapi.yaml`.

Validate it locally with:

```bash
npm run openapi:validate
```

Preview a static Redoc page with:

```bash
npm run openapi:preview
```

The preview command writes `/tmp/flagforge-openapi.html`; open that file in a browser to view the rendered contract. API behavior changes must keep OpenSpec specs, tests, and `docs/api/openapi.yaml` aligned in the same change.

## Local PostgreSQL

Create a local `.env` from `.env.example` for host runtime, migration, Compose, and PostgreSQL integration test defaults. It provides `PORT`, `ADMIN_API_KEY`, `DATABASE_PORT`, `DATABASE_URL`, `TEST_DATABASE_PORT`, `TEST_DATABASE_URL`, and `COMPOSE_PROJECT_NAME`.

`ADMIN_API_KEY` is required when starting the API outside tests. The checked-in example value `dev-admin-api-key` is only a non-secret local development value. Protected admin endpoints require it in the `X-Admin-API-Key` header:

```bash
curl --fail -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:3000/flags
```

Start the local development database with Docker Compose:

```bash
docker compose up -d postgres
```

The development database uses `postgres://flagforge:flagforge@localhost:5432/flagforge` by default. Override `DATABASE_PORT` for a different host port and update `DATABASE_URL` to the same port.

Apply migrations before starting the API:

```bash
npm run db:migrate
npm run dev
```

PostgreSQL integration tests are destructive for the database named by `TEST_DATABASE_URL`: the harness truncates feature flags and audit events before each test. Start the isolated test service and use the `TEST_` values from root `.env`:

```bash
docker compose up -d postgres-test
npm run test:postgres
```

`TEST_DATABASE_URL` points at `postgres://flagforge:flagforge@localhost:5433/flagforge_test` by default. Override `TEST_DATABASE_PORT` for a different host port and update `TEST_DATABASE_URL` to the same port. The integration harness requires `TEST_DATABASE_URL` and never falls back to `DATABASE_URL`.

## Docker

Build the production API image:

```bash
docker build -t flagforge-api:local .
```

Run the local app plus PostgreSQL stack after applying migrations:

```bash
docker compose up -d postgres
npm run db:migrate
docker compose up -d app
curl --fail http://localhost:3000/health
curl --fail -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:3000/flags
```

The app container uses `DATABASE_URL=postgres://flagforge:flagforge@postgres:5432/flagforge` inside the Compose network and exposes the API on port `3000` by default. Override the API host port with `PORT`. Compose also honors `DATABASE_PORT` and `TEST_DATABASE_PORT` for the runtime and test PostgreSQL host ports. Migrations are intentionally not run by the app container startup command.

Run the local Kong gateway through Docker Compose after the app service is available:

```bash
docker compose up -d app kong
curl --fail http://localhost:${PORT:-3000}/health
curl --fail http://localhost:${KONG_PROXY_PORT:-8000}/health
make smoke-gateway
```

Kong uses DB-less declarative configuration from `infra/kong/kong.yml` and routes to the Compose `app` service. Direct app access remains available through `${PORT:-3000}`. Override the gateway host port with `KONG_PROXY_PORT`; Kong defaults to `8000`. Kong Admin API ports are not published by default.

Run local Prometheus and Grafana after the Compose app is available:

```bash
docker compose up -d app prometheus grafana
curl --fail "http://localhost:${PROMETHEUS_PORT:-9090}/api/v1/query?query=up%7Bjob%3D%22flagforge-api%22%7D"
curl --fail http://localhost:${GRAFANA_PORT:-3001}/api/health
make smoke-prometheus
make smoke-grafana
```

Prometheus scrapes the existing `GET /metrics` endpoint through the Compose-network target `app:3000`. Grafana provisions the `FlagForge Prometheus` datasource and `FlagForge Local Overview` dashboard from `infra/observability/grafana/`. Open `http://localhost:${PROMETHEUS_PORT:-9090}/targets` to inspect scrape target health and `http://localhost:${GRAFANA_PORT:-3001}` to view the dashboard. This Level 1 local workflow uses Prometheus and Grafana only; it does not provide kind/Kubernetes observability, production SLOs, alerting, OpenTelemetry Collector deployment, AWS observability, Datadog, or vendor-managed monitoring.

## Make Targets

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
make smoke-prometheus
make smoke-grafana
make verify
```

The local Kong workflow does not add authentication, authorization, rate limiting, production hardening, Helm, kind, Argo CD, cloud deployment, registry publishing, or observability. Local Prometheus and Grafana validation remains outside `npm run verify`.
