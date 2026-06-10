## 1. Environment Loading

- [ ] 1.1 Add the `dotenv` dependency needed for TypeScript entrypoint environment loading.
- [ ] 1.2 Create a shared local environment loader that configures `.env` once per process.
- [ ] 1.3 Import the local environment loader from `src/server.ts`.
- [ ] 1.4 Import the local environment loader for the migration CLI path without changing reusable migration functions.

## 2. Isolated PostgreSQL Test Database

- [ ] 2.1 Add a Docker Compose PostgreSQL test service with non-secret defaults, a `flagforge_test` database, health check, volume, and host access distinct from the development database.
- [ ] 2.2 Add a committed non-secret `.env.test` that sets `TEST_DATABASE_URL` for the isolated local test database.
- [ ] 2.3 Update `.env.example` so it documents only local runtime and migration defaults, not a destructive test database URL.

## 3. PostgreSQL Integration Harness

- [ ] 3.1 Load `.env.test` from the PostgreSQL integration test bootstrap.
- [ ] 3.2 Remove fallback from `TEST_DATABASE_URL` to `DATABASE_URL`.
- [ ] 3.3 Ensure the PostgreSQL integration suite reports a clear diagnostic when `TEST_DATABASE_URL` is absent.
- [ ] 3.4 Add or update tests covering the required `TEST_DATABASE_URL` behavior and preserving explicit env parsing behavior.

## 4. Documentation and Wrappers

- [ ] 4.1 Update README local PostgreSQL instructions to distinguish development runtime, migrations, and destructive PostgreSQL integration tests.
- [ ] 4.2 Update `docs/runbooks/local-development.md` with `.env`, `.env.test`, Compose service, and troubleshooting guidance.
- [ ] 4.3 Update Makefile wrappers if needed so database startup targets expose the development and test database workflows clearly.

## 5. Verification

- [ ] 5.1 Run focused unit/config tests for PostgreSQL environment behavior.
- [ ] 5.2 Run `npm run test:postgres` against the isolated PostgreSQL test database when Docker is available.
- [ ] 5.3 Run `openspec validate isolate-postgres-test-database --strict`.
- [ ] 5.4 Run `npm run verify` before marking implementation complete.
