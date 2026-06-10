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
- Verify behavior with Vitest, Supertest, TypeScript, ESLint, Prettier, and OpenSpec validation.

## Delivery Model

OpenSpec is the source of truth for behavior changes. Durable decisions live in `docs/adr/`, focused context lives in `docs/context/`, and reusable delivery assets live in `docs/templates/` and `docs/agent-playbooks/`.

## Commands

```bash
npm install
docker compose up -d postgres
npm run db:migrate
npm run dev
npm test
npm run test:postgres
npm run build
docker build -t flagforge-api:local .
docker compose up -d app
curl --fail http://localhost:3000/health
npm run verify
```

Use `npm run verify` before treating implementation work as complete. It runs host-only checks and does not require Docker or PostgreSQL. Run PostgreSQL integration, Docker build, and Compose smoke checks explicitly when those tools are available.

## Local PostgreSQL

Start the local database with Docker Compose:

```bash
docker compose up -d postgres
```

Use this non-secret local connection string for development:

```bash
export DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
```

Apply migrations before starting the API:

```bash
npm run db:migrate
npm run dev
```

PostgreSQL integration tests require a real database. Point them at a database with `TEST_DATABASE_URL`; if it is omitted, the harness uses `DATABASE_URL`.

## Docker

Build the production API image:

```bash
docker build -t flagforge-api:local .
```

Run the local app plus PostgreSQL stack after applying migrations:

```bash
docker compose up -d postgres
export DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
npm run db:migrate
docker compose up -d app
curl --fail http://localhost:3000/health
```

The app container uses `DATABASE_URL=postgres://flagforge:flagforge@postgres:5432/flagforge` inside the Compose network and exposes the API on port `3000` by default. Migrations are intentionally not run by the app container startup command.

## Make Targets

```bash
make db-up
make db-migrate
make test-unit
make test-postgres
make build
make docker-build
make compose-up
make smoke-health
make verify
```

Helm, kind, Argo CD, Kong, registry publishing, deployment, OpenAPI, and observability are out of scope for this repository change.
