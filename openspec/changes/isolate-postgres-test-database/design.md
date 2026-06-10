## Context

FlagForge uses PostgreSQL as the runtime persistence path. Local development currently relies on contributors exporting `DATABASE_URL`, `TEST_DATABASE_URL`, and `PORT` manually, while the PostgreSQL integration test suite reads `TEST_DATABASE_URL ?? DATABASE_URL` and truncates `audit_events` and `feature_flags` before each test.

The committed `.env.example` and local runbook currently point `TEST_DATABASE_URL` at the same `flagforge` database used by runtime and migrations. This creates a destructive path where following documented commands can erase local development data.

## Goals / Non-Goals

**Goals:**

- Load local runtime and migration configuration from `.env` without requiring inline environment variables in npm scripts.
- Keep TypeScript entrypoints responsible for environment bootstrap so npm scripts remain simple.
- Provide an isolated PostgreSQL test database through Docker Compose.
- Load PostgreSQL integration test configuration from `.env.test`.
- Make `TEST_DATABASE_URL` mandatory for PostgreSQL integration tests and remove fallback to `DATABASE_URL`.
- Document that the PostgreSQL integration suite is destructive for the configured test database.

**Non-Goals:**

- Do not change public HTTP API behavior.
- Do not introduce production secret management.
- Do not run migrations automatically from the API container startup command.
- Do not make `npm run verify` depend on Docker or PostgreSQL.
- Do not replace PostgreSQL with another persistence technology.

## Decisions

### Use a shared local environment loader for runtime entrypoints

Add a small TypeScript module that imports and configures `dotenv` for `.env`, then import that module from executable entrypoints such as `src/server.ts` and the migration CLI path.

Rationale: this keeps environment bootstrap in code where it is visible to TypeScript entrypoints and avoids adding environment declarations to `package.json` scripts. Node ESM module caching means the loader module is evaluated once per process for the same import specifier, even if multiple entrypoints or imported modules reference it.

Alternatives considered:

- Put `dotenv` or environment variables in npm scripts. Rejected because the project wants scripts to stay simple and avoid shell-specific inline configuration.
- Call `dotenv.config()` directly in every file that reads `process.env`. Rejected because it spreads bootstrap behavior across runtime modules and makes accidental repeated configuration more likely.
- Load `.env` from domain or infrastructure modules. Rejected because reusable modules should not perform process-level bootstrap as a side effect.

### Use `.env.test` for PostgreSQL integration test configuration

Commit a non-secret local `.env.test` that defines `TEST_DATABASE_URL` for the isolated local test database. The PostgreSQL integration test bootstrap loads `.env.test` before reading configuration.

Rationale: the test command stays free of inline environment declarations, while the destructive test database remains explicit and reviewable in the repository.

Alternatives considered:

- Keep `TEST_DATABASE_URL` in `.env.example`. Rejected because contributors should not have to maintain test database settings in their runtime `.env`.
- Require contributors to export `TEST_DATABASE_URL` manually. Rejected because it preserves the current setup friction and makes mistakes more likely.

### Add a dedicated Compose PostgreSQL service for tests

Extend Docker Compose with a separate PostgreSQL test service that uses the `flagforge_test` database and a distinct host port from the runtime development database.

Rationale: a separate service and port makes accidental aliasing harder. The integration suite can truncate the test database freely without affecting local runtime data.

Alternatives considered:

- Use one PostgreSQL service with two databases. Rejected for now because a distinct service/port gives a stronger visual and operational separation for a destructive test harness.
- Reuse the runtime `postgres` service and create a `flagforge_test` database there. Rejected because it still couples runtime and destructive test workflows to the same container lifecycle.

### Require `TEST_DATABASE_URL` for PostgreSQL integration tests

Remove the integration test fallback from `DATABASE_URL` to `TEST_DATABASE_URL`. If `.env.test` is missing or invalid, the suite must fail or skip with a clear diagnostic instead of using the runtime database.

Rationale: fallback from test configuration to runtime configuration is the unsafe edge. PostgreSQL integration tests truncate tables and therefore must require an explicit destructive-test target.

Alternatives considered:

- Keep fallback but reject URLs containing `/flagforge`. Rejected because it is brittle and still allows unsafe aliases with different database names.
- Keep fallback for convenience. Rejected because convenience here can destroy local data.

## Risks / Trade-offs

- Contributors may need to start two Compose services for full local validation -> document `postgres` for runtime and `postgres-test` for PostgreSQL integration tests, with Makefile wrappers where useful.
- Committing `.env.test` can be mistaken for production configuration -> keep only non-secret localhost defaults and document it as local-only.
- Loading dotenv in code can affect tests that intentionally pass explicit env objects -> keep parser tests isolated by passing explicit env maps and limit dotenv imports to entrypoints/test bootstrap.
- A separate test service uses another local port -> choose a documented port distinct from `5432` and include troubleshooting guidance for conflicts.
