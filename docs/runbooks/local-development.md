# Local Development Runbook

## Environment

Use one root `.env` file for non-secret Docker-backed local defaults. Start from `.env.example`:

```bash
COMPOSE_PROJECT_NAME=flagforge
PORT=3000
DATABASE_PORT=5432
DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
TEST_DATABASE_PORT=5433
TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5433/flagforge_test
```

`COMPOSE_PROJECT_NAME` is read by Docker Compose on the host to isolate project resources such as containers, networks, and volumes. It is not a container runtime setting.

`DATABASE_URL` is used by the API runtime and `npm run db:migrate`. `TEST_DATABASE_URL` is used only by PostgreSQL integration tests. Those tests are destructive for the configured test database and never fall back to `DATABASE_URL`, even though the `TEST_` values live in the same local `.env` file.

Keep `DATABASE_URL` and `TEST_DATABASE_URL` explicit. If you change `DATABASE_PORT` or `TEST_DATABASE_PORT`, update the matching URL port as well; local dotenv loading does not compose URL values from other variables.

For parallel worktrees, use distinct Compose project names and host ports in each worktree's `.env`:

```bash
COMPOSE_PROJECT_NAME=flagforge-exp-17
PORT=3017
DATABASE_PORT=5542
DATABASE_URL=postgres://flagforge:flagforge@localhost:5542/flagforge
TEST_DATABASE_PORT=5543
TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5543/flagforge_test
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

Run checks:

```bash
npm test
docker compose up -d postgres-test
npm run test:postgres
npm run build
npm run verify
```

`npm run verify` is host-only and does not require Docker or PostgreSQL. It includes OpenAPI validation. Run PostgreSQL integration tests separately when a database is available.

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
make verify
```

## Troubleshooting

If migrations cannot connect, confirm PostgreSQL is healthy with `docker compose ps postgres` and verify `DATABASE_URL` points at the host and port selected by `DATABASE_PORT` for host commands.

If PostgreSQL integration tests report that `TEST_DATABASE_URL` is required, confirm `.env` exists or export `TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5433/flagforge_test`.

If PostgreSQL integration tests fail to connect, confirm the test database is healthy with `docker compose ps postgres-test` and verify no other local service is using the host port selected by `TEST_DATABASE_PORT`.

If the Compose app cannot connect to PostgreSQL, confirm the app service uses the Compose-network hostname `postgres` in `DATABASE_URL`.

If `/health` fails, check `docker compose logs app postgres`, confirm migrations ran successfully, and verify the expected host port with `docker compose ps`.

## Out of Scope

Helm, kind, Argo CD, Kong, registry publishing, deployment, and observability remain out of scope for this change.
