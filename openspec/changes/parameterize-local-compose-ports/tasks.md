## 1. Compose Configuration

- [ ] 1.1 Update `docker-compose.yml` so the runtime PostgreSQL service maps `${DATABASE_PORT:-5432}:5432`.
- [ ] 1.2 Update `docker-compose.yml` so the PostgreSQL integration test service maps `${TEST_DATABASE_PORT:-5433}:5432`.
- [ ] 1.3 Confirm the app service keeps `${PORT:-3000}:3000` and does not receive `COMPOSE_PROJECT_NAME` as a container environment variable.
- [ ] 1.4 Confirm the solution does not require Compose `include`, service-level `env_file`, or CLI `--env-file` for local test database port interpolation.

## 2. Environment Examples

- [ ] 2.1 Update `.env.example` with `COMPOSE_PROJECT_NAME=flagforge`, `PORT=3000`, `DATABASE_PORT=5432`, `DATABASE_URL`, `TEST_DATABASE_PORT=5433`, and `TEST_DATABASE_URL`.
- [ ] 2.2 Remove the committed `.env.test` file and update the test harness to load root `.env` for local PostgreSQL integration test defaults.
- [ ] 2.3 Ensure `TEST_DATABASE_URL` remains required and the test harness does not fall back to `DATABASE_URL`.
- [ ] 2.4 Ensure the examples keep `DATABASE_URL` and `TEST_DATABASE_URL` explicit and aligned with the documented host ports.

## 3. Documentation

- [ ] 3.1 Update `docs/runbooks/local-development.md` to describe the single `.env` local configuration file, default local ports, and the role of `COMPOSE_PROJECT_NAME`.
- [ ] 3.2 Add a parallel worktree example to the local development runbook using distinct `PORT`, `DATABASE_PORT`, `TEST_DATABASE_PORT`, `DATABASE_URL`, and `TEST_DATABASE_URL` values.
- [ ] 3.3 Update README Docker/PostgreSQL guidance to mention configurable `PORT`, `DATABASE_PORT`, and `TEST_DATABASE_PORT`.
- [ ] 3.4 Document that changing database port variables requires updating the matching explicit database URL.
- [ ] 3.5 Document that `TEST_` variables are destructive test configuration even though they live in the same local `.env` file.

## 4. Validation

- [ ] 4.1 Run `openspec validate parameterize-local-compose-ports --strict`.
- [ ] 4.2 Run `npm run format:check` or format the touched files if needed.
- [ ] 4.3 If Docker Compose is available, run `docker compose config` with default environment to confirm default port mappings remain `3000`, `5432`, and `5433`.
- [ ] 4.4 If Docker Compose is available, run `docker compose config` with non-default values in `.env` to confirm `PORT`, `DATABASE_PORT`, `TEST_DATABASE_PORT`, and `COMPOSE_PROJECT_NAME` are honored.
- [ ] 4.5 Run `npm run verify` before marking implementation complete, and report any environment-limited Docker checks that could not be run.
