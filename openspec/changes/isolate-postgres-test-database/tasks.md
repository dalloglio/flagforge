## 1. Environment Loading

- [x] 1.1 Add the `dotenv` dependency needed for TypeScript entrypoint environment loading.
- [x] 1.2 Create a shared local environment loader that configures `.env` once per process.
- [x] 1.3 Import the local environment loader from `src/server.ts`.
- [x] 1.4 Import the local environment loader for the migration CLI path without changing reusable migration functions.

## 2. Isolated PostgreSQL Test Database

- [x] 2.1 Add a Docker Compose PostgreSQL test service with non-secret defaults, a `flagforge_test` database, health check, volume, and host access distinct from the development database.
- [x] 2.2 Add a committed non-secret `.env.test` that sets `TEST_DATABASE_URL` for the isolated local test database.
- [x] 2.3 Update `.env.example` so it documents only local runtime and migration defaults, not a destructive test database URL.

## 3. PostgreSQL Integration Harness

- [x] 3.1 Load `.env.test` from the PostgreSQL integration test bootstrap.
- [x] 3.2 Remove fallback from `TEST_DATABASE_URL` to `DATABASE_URL`.
- [x] 3.3 Ensure the PostgreSQL integration suite reports a clear diagnostic when `TEST_DATABASE_URL` is absent.
- [x] 3.4 Add or update tests covering the required `TEST_DATABASE_URL` behavior and preserving explicit env parsing behavior.

## 4. Documentation and Wrappers

- [x] 4.1 Update README local PostgreSQL instructions to distinguish development runtime, migrations, and destructive PostgreSQL integration tests.
- [x] 4.2 Update `docs/runbooks/local-development.md` with `.env`, `.env.test`, Compose service, and troubleshooting guidance.
- [x] 4.3 Update Makefile wrappers if needed so database startup targets expose the development and test database workflows clearly.

## 5. Verification

- [x] 5.1 Run focused unit/config tests for PostgreSQL environment behavior.
- [x] 5.2 Run `npm run test:postgres` against the isolated PostgreSQL test database when Docker is available.
- [x] 5.3 Run `openspec validate isolate-postgres-test-database --strict`.
- [x] 5.4 Run `npm run verify` before marking implementation complete.
