## 1. Database Setup

- [ ] 1.1 Add PostgreSQL client and any minimal migration/test harness dependencies to `package.json`.
- [ ] 1.2 Add database configuration parsing for runtime and test usage without logging secret values.
- [ ] 1.3 Add a Docker Compose PostgreSQL service with non-secret local development defaults and a named volume.
- [ ] 1.4 Document the local database startup and migration commands in the repository where developers will find them.

## 2. Migrations

- [ ] 2.1 Add versioned SQL migration files for feature flag, audit event, and migration history tables.
- [ ] 2.2 Implement a Node.js migration runner that applies SQL files in lexical order.
- [ ] 2.3 Record applied migration filenames and checksums so repeat runs skip already-applied migrations.
- [ ] 2.4 Add a focused migration test or integration setup check proving an empty PostgreSQL database is prepared from migrations.

## 3. Repository Boundaries

- [ ] 3.1 Introduce async repository contracts for feature flag storage and audit-log storage.
- [ ] 3.2 Keep in-memory repositories available as explicit test doubles behind the same async contracts.
- [ ] 3.3 Implement PostgreSQL feature flag repository methods for create, list, get, and update while preserving cloned public flag shapes.
- [ ] 3.4 Implement PostgreSQL audit-log repository methods for append and list with optional `flagKey` filtering.
- [ ] 3.5 Re-parse hydrated PostgreSQL rows through domain schemas or equivalent validation before returning domain objects.

## 4. Application Wiring

- [ ] 4.1 Convert API route handlers to await async repository calls while preserving current status codes, response bodies, and validation errors.
- [ ] 4.2 Update default runtime wiring so the server uses PostgreSQL-backed repositories from explicit database configuration.
- [ ] 4.3 Preserve test dependency injection so focused API and domain tests can pass explicit in-memory repositories.
- [ ] 4.4 Add sanitized startup or persistence diagnostics for missing, invalid, or unavailable PostgreSQL configuration.

## 5. Atomic Mutations and Audit Logging

- [ ] 5.1 Add a focused transaction path for successful flag create plus `flag_created` audit append.
- [ ] 5.2 Add a focused transaction path for successful flag update plus `flag_updated` audit append.
- [ ] 5.3 Ensure duplicate-key, not-found, and validation failures do not persist audit events.
- [ ] 5.4 Ensure audit event snapshots are stored immutably and remain unchanged after later flag updates.

## 6. Integration Tests

- [ ] 6.1 Add a PostgreSQL integration test harness that requires a real database and applies migrations before tests.
- [ ] 6.2 Add integration coverage proving created and updated flags survive repository or application lifecycle boundaries.
- [ ] 6.3 Add integration coverage proving persisted flags with targeting rules evaluate the same after restart.
- [ ] 6.4 Add integration coverage proving percentage rollout decisions remain stable after restart for the same context.
- [ ] 6.5 Add integration coverage proving audit events survive restart and list oldest-to-newest globally and by `flagKey`.
- [ ] 6.6 Add integration coverage proving rejected create and update requests persist no audit events.
- [ ] 6.7 Add integration coverage proving PostgreSQL unavailable or missing configuration fails clearly without in-memory fallback.

## 7. Regression and Verification

- [ ] 7.1 Update existing API, evaluator, and audit-log tests for async repository contracts without weakening current assertions.
- [ ] 7.2 Add or update package scripts needed for migrations and PostgreSQL integration tests.
- [ ] 7.3 Run focused tests for repository, migration, API, evaluation, and audit-log behavior while iterating.
- [ ] 7.4 Run `npm run verify` with PostgreSQL available before considering implementation complete.
- [ ] 7.5 Run `openspec validate add-postgresql-persistence --strict` and `openspec validate --all --strict` after implementation updates.
