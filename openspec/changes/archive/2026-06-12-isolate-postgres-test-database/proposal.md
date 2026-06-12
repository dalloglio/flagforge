## Why

Local PostgreSQL integration tests currently can point at the same database used for development runtime and migrations. Because the integration suite truncates `audit_events` and `feature_flags` before each test, the documented local workflow can delete a contributor's local feature flags and audit history.

## What Changes

- Load local development configuration from `.env` inside TypeScript entrypoints instead of requiring contributors to export `DATABASE_URL` and `PORT` by hand.
- Add an isolated Docker Compose PostgreSQL service/database for destructive PostgreSQL integration tests.
- Use `.env.test` for PostgreSQL integration test configuration instead of requiring inline environment variables in `package.json` scripts.
- Require PostgreSQL integration tests to use `TEST_DATABASE_URL`; remove fallback to `DATABASE_URL`.
- Update `.env.example`, local documentation, and troubleshooting guidance so runtime and test databases are distinct.
- Document that PostgreSQL integration tests are destructive for the database named by `TEST_DATABASE_URL`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `containerized-runtime`: Local environment documentation and Compose workflow must distinguish the development database from the destructive PostgreSQL integration test database.
- `ci-quality`: PostgreSQL integration verification must require an explicit test database URL and must not fall back to the runtime database URL.

## Impact

- Affected code: TypeScript runtime and migration entrypoints, PostgreSQL integration test bootstrap, PostgreSQL configuration tests where needed.
- Affected configuration: `.env.example`, `.env.test`, Docker Compose services, npm scripts, Makefile wrappers if they reference database startup assumptions.
- Affected documentation: README and local development runbook.
- Dependencies: add `dotenv` for local environment loading.
