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
make smoke-health
make smoke-gateway
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

## Out of Scope

Local Kong does not add authentication, authorization, production hardening, kind, Argo CD, cloud deployment, registry publishing, or observability. Admin API rate limiting is currently local in-process application behavior, not distributed production quota enforcement.
