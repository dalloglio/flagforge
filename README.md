# FlagForge

FlagForge is a completed v1 learning and portfolio project: a TypeScript/Express
feature flag API surrounded by a source-controlled delivery and platform
engineering practice environment. The project is now in **Completed portfolio
project - maintenance mode**. See [Project status](docs/project-status.md) for
the lifecycle record, evidence matrix, limitations, and future `v1.0.0`
release checklist.

The project demonstrates OpenSpec-driven delivery from product behavior through
local platform exercises and credential-free AWS foundation contracts. Roadmap
completion describes the planned learning outcomes; it does not claim a
production SaaS, a continuously operated AWS environment, or a published GitHub
release.

## Current Capabilities

- Create and update feature flags.
- Evaluate feature flags through an HTTP API.
- Validate external input with Zod.
- Apply simple targeting rules and deterministic percentage rollouts.
- Record and list durable audit events for flag mutations.
- Persist feature flags and audit events in PostgreSQL.
- Protect administrative endpoints with a configured API key and in-process
  fixed-window rate limiting.
- Expose health, liveness, readiness, and Prometheus metrics endpoints.
- Enable configurable local OpenTelemetry HTTP tracing with console export.
- Verify behavior with Vitest, Supertest, TypeScript, ESLint, Prettier, OpenAPI validation, and OpenSpec validation.

## Architecture

- `src/domain/` owns feature flag types, validation, repository contracts,
  audit event construction, and deterministic evaluation.
- `src/application/` orchestrates flag and audit-log use cases.
- `src/api/` owns Express routing, authentication, rate limiting, validation,
  dependency wiring, metrics, and transport error mapping.
- `src/infrastructure/postgres/` owns configuration, migrations, repository
  adapters, and transactions.
- `src/infrastructure/telemetry/` owns OpenTelemetry startup and HTTP
  instrumentation.

The domain remains independent from Express, PostgreSQL, telemetry, Kubernetes,
and AWS. The canonical HTTP contract is [the OpenAPI document](docs/api/openapi.yaml).

## Platform Roadmap Evidence

FlagForge uses five explicit evidence classes: **implemented and exercised
locally**, **implemented contract and statically validated**, **prepared but
externally dependent**, **deliberately out of scope**, and **optional v2
direction**.

- **Level 1 - completed local practice:** Docker and Docker Compose,
  PostgreSQL, Helm, kind, local Argo CD desired state and sync procedures, Kong,
  Prometheus/Grafana, operational endpoints, and configurable local
  OpenTelemetry tracing. Each item is limited to the local validation scope
  recorded in the project status and runbooks.
- **Level 3 - completed foundations/contracts:** OpenTofu/Terragrunt structure,
  static RDS PostgreSQL, EKS, and ALB contracts, a guarded ECR publishing
  workflow, AWS `dev` GitOps desired state, and AWS runbooks. These assets are
  statically validated or prepared for external activation; no account-backed
  `plan`, `apply`, ECR publication, live cluster sync, or real AWS operation is
  claimed.

## Delivery Model

OpenSpec specs are the source of truth for required behavior. Changes use
versioned proposals, designs, delta specs, tasks, test plans, and applicable
role-based reviews before their requirements are archived into the main spec
set. Durable decisions live in `docs/adr/`, focused current context lives in
`docs/context/`, the lifecycle and evidence record lives in
`docs/project-status.md`, and reusable delivery assets live in `docs/templates/`
and `docs/agent-playbooks/`.

Accepted ADRs and `docs/decision-log.md` preserve decision-time history; they
are not the source for current implementation status.

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

The local values file is `charts/flagforge-api/values-local.yaml`. It uses non-secret local defaults for the completed Level 1 kind path, including `DATABASE_URL=postgres://flagforge:flagforge@postgres:5432/flagforge` and `ADMIN_API_KEY=dev-admin-api-key`.

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

## ECR Image Publishing

The publish-capable GitHub Actions workflow is `.github/workflows/publish-ecr-image.yml`. It represents the externally dependent ECR path for repository `flagforge-api` in the AWS `dev` target in `us-east-1` and uses `<yyyymmdd>.<short-sha>` tags such as `20260704.abcd123`.

Publishing is disabled unless `ECR_PUBLISHING_ENABLED=true` is configured after the future AWS prerequisite change provisions ECR, lifecycle policy, OIDC role `flagforge-github-actions-ecr-publisher-dev`, protected `main`, and the `aws-dev` GitHub environment. The workflow runs Trivy before ECR login or push and fails on high or critical findings. Full activation, retention, rollback, and review expectations are documented in `docs/runbooks/ecr-image-publishing.md`.

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

The local Kong workflow does not itself add authentication, authorization, rate
limiting, production hardening, Helm, kind, Argo CD, cloud deployment, registry
publishing, or observability. Application authentication and rate limiting
remain active through the gateway path. Local Prometheus and Grafana validation
remains outside `npm run verify`.

## Limitations and Maintenance

FlagForge v1 intentionally does not claim tenancy, multiple flag environments,
SDKs, segments, full RBAC, distributed rate limiting, production secret
management, live cloud provisioning, customer operation, SLA/SLO commitments,
validated disaster recovery, multi-region operation, or 24x7 support. A
production-oriented image, a production-style GitOps pattern, or static IaC is
not evidence of production readiness.

Maintenance mode allows bug fixes, security fixes, dependency and compatibility
maintenance, and documentation corrections. New product or platform behavior
requires explicit prioritization and a new OpenSpec change. Optional v2 themes
in the project status are not backlog or delivery commitments.

Package and Helm chart metadata currently use `1.0.0`; that metadata is not
proof that a `v1.0.0` Git tag or GitHub release has been published.

## Runbooks

- [Local development and Level 1 platform](docs/runbooks/local-development.md)
- [AWS IaC foundation](docs/runbooks/aws-iac-foundation.md)
- [AWS RDS PostgreSQL contract](docs/runbooks/aws-rds-postgresql.md)
- [AWS EKS and ALB contracts](docs/runbooks/aws-eks-alb-runtime.md)
- [ECR image publishing](docs/runbooks/ecr-image-publishing.md)
- [AWS GitOps desired state](docs/runbooks/aws-gitops-deployment.md)
