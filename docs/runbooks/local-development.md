# Local Development Runbook

## Environment

Use non-secret local defaults for Docker-backed development. Keep runtime and destructive test configuration in separate dotenv files:

```bash
.env
DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
PORT=3000

.env.test
TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5433/flagforge_test
```

`DATABASE_URL` is used by the API runtime and `npm run db:migrate`. `TEST_DATABASE_URL` is used only by PostgreSQL integration tests. Those tests are destructive for the configured test database and never fall back to `DATABASE_URL`.

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

The PostgreSQL integration harness loads `.env.test`, applies migrations to `flagforge_test`, and truncates `audit_events` and `feature_flags` before each test.

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

If migrations cannot connect, confirm PostgreSQL is healthy with `docker compose ps postgres` and verify `DATABASE_URL` points at `localhost:5432` for host commands.

If PostgreSQL integration tests report that `TEST_DATABASE_URL` is required, confirm `.env.test` exists or export `TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5433/flagforge_test`.

If PostgreSQL integration tests fail to connect, confirm the test database is healthy with `docker compose ps postgres-test` and verify no other local service is using host port `5433`.

If the Compose app cannot connect to PostgreSQL, confirm the app service uses the Compose-network hostname `postgres` in `DATABASE_URL`.

If `/health` fails, check `docker compose logs app postgres`, confirm migrations ran successfully, and verify the expected host port with `docker compose ps`.

## Out of Scope

Helm, kind, Argo CD, Kong, registry publishing, deployment, and observability remain out of scope for this change.
