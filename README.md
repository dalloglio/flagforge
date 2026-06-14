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
docker compose up -d app
curl --fail http://localhost:3000/health
curl --fail -H 'X-Admin-API-Key: dev-admin-api-key' http://localhost:3000/flags
npm run openapi:validate
npm run openapi:preview
npm run verify
```

Use `npm run verify` before treating implementation work as complete. It runs host-only checks, including OpenAPI validation, and does not require Docker or PostgreSQL. Run PostgreSQL integration, Docker build, and Compose smoke checks explicitly when those tools are available.

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
make smoke-health
make verify
```

Helm, kind, Argo CD, Kong, registry publishing, deployment, and observability are out of scope for this repository change.
