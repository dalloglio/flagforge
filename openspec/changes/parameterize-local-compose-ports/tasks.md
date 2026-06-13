## 1. Compose Configuration

- [ ] 1.1 Update `docker-compose.yml` so the runtime PostgreSQL service maps `${DATABASE_PORT:-5432}:5432`.
- [ ] 1.2 Update `docker-compose.yml` so the PostgreSQL integration test service maps `${TEST_DATABASE_PORT:-5433}:5432`.
- [ ] 1.3 Confirm the app service keeps `${PORT:-3000}:3000` and does not receive `COMPOSE_PROJECT_NAME` as a container environment variable.

## 2. Environment Examples

- [ ] 2.1 Update `.env.example` with `COMPOSE_PROJECT_NAME=flagforge`, `DATABASE_PORT=5432`, and the existing `PORT=3000` and `DATABASE_URL` defaults.
- [ ] 2.2 Update `.env.test` with `TEST_DATABASE_PORT=5433` and the existing `TEST_DATABASE_URL` default.
- [ ] 2.3 Ensure the examples keep `DATABASE_URL` and `TEST_DATABASE_URL` explicit and aligned with the documented host ports.

## 3. Documentation

- [ ] 3.1 Update `docs/runbooks/local-development.md` to describe default local ports and the role of `COMPOSE_PROJECT_NAME`.
- [ ] 3.2 Add a parallel worktree example to the local development runbook using distinct `PORT`, `DATABASE_PORT`, `TEST_DATABASE_PORT`, `DATABASE_URL`, and `TEST_DATABASE_URL` values.
- [ ] 3.3 Update README Docker/PostgreSQL guidance to mention configurable `PORT`, `DATABASE_PORT`, and `TEST_DATABASE_PORT`.
- [ ] 3.4 Document that changing database port variables requires updating the matching explicit database URL.

## 4. Validation

- [ ] 4.1 Run `openspec validate parameterize-local-compose-ports --strict`.
- [ ] 4.2 Run `npm run format:check` or format the touched files if needed.
- [ ] 4.3 If Docker Compose is available, inspect or run the default Compose configuration to confirm default port mappings remain `3000`, `5432`, and `5433`.
- [ ] 4.4 If Docker Compose is available, inspect or run a non-default configuration to confirm `PORT`, `DATABASE_PORT`, `TEST_DATABASE_PORT`, and `COMPOSE_PROJECT_NAME` are honored.
- [ ] 4.5 Run `npm run verify` before marking implementation complete, and report any environment-limited Docker checks that could not be run.
