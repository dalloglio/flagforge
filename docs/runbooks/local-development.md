# Local Development Runbook

## Environment

Use non-secret local defaults for Docker-backed development:

```bash
export DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
export TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
export PORT=3000
```

`DATABASE_URL` is used by the API runtime and `npm run db:migrate`. `TEST_DATABASE_URL` is used by PostgreSQL integration tests; if it is not set, the test harness falls back to `DATABASE_URL`.

## Local Workflow

Install dependencies:

```bash
npm install
```

Start PostgreSQL:

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
npm run test:postgres
npm run build
npm run verify
```

`npm run verify` is host-only and does not require Docker or PostgreSQL. Run PostgreSQL integration tests separately when a database is available.

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

The Compose app service does not run migrations automatically. Keep migrations as an explicit prerequisite with `npm run db:migrate` or `make db-migrate`.

## Makefile Shortcuts

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

## Troubleshooting

If migrations cannot connect, confirm PostgreSQL is healthy with `docker compose ps postgres` and verify `DATABASE_URL` points at `localhost:5432` for host commands.

If PostgreSQL integration tests skip or fail to connect, set `TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge` and confirm migrations have run.

If the Compose app cannot connect to PostgreSQL, confirm the app service uses the Compose-network hostname `postgres` in `DATABASE_URL`.

If `/health` fails, check `docker compose logs app postgres`, confirm migrations ran successfully, and verify the expected host port with `docker compose ps`.

## Out of Scope

Helm, kind, Argo CD, Kong, registry publishing, deployment, OpenAPI, and observability remain out of scope for this change.
