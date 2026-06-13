## Context

FlagForge already has a Docker Compose workflow with three local services: `app`, `postgres`, and `postgres-test`. The API host port is parameterized with `PORT`, but the runtime and test PostgreSQL host ports are fixed at `5432` and `5433`. That works for one checkout, but it blocks parallel worktree experiments because each Compose project tries to bind the same host ports.

The project currently separates host runtime defaults in `.env` from PostgreSQL integration test defaults in `.env.test`. That separation protects the runtime database from destructive tests, but it adds Compose configuration complexity once the test database host port also needs to be configurable. Since test-only variables already use the `TEST_` prefix, the local development contract can be simpler: one root `.env` copied from `.env.example` contains all non-secret local defaults, and tests continue to require `TEST_DATABASE_URL` explicitly.

## Goals / Non-Goals

**Goals:**

- Preserve the default local workflow on API port `3000`, runtime PostgreSQL port `5432`, and test PostgreSQL port `5433`.
- Allow each worktree to choose distinct host ports through `PORT`, `DATABASE_PORT`, and `TEST_DATABASE_PORT` values.
- Document `COMPOSE_PROJECT_NAME` so Compose resources are isolated per worktree.
- Keep runtime and integration test database URLs explicit and aligned with the selected host ports.
- Keep migrations as an explicit host command before running the Compose app service.
- Eliminate the committed `.env.test` file and load local test defaults from root `.env`.

**Non-Goals:**

- Do not change public API behavior, persistence semantics, database schema, or migration behavior.
- Do not add new dependencies such as dotenv variable expansion.
- Do not introduce automatic migration execution in the app container.
- Do not change production deployment configuration or add Kubernetes/Helm behavior.

## Decisions

### Use Compose variable interpolation for host ports

`docker-compose.yml` will map host ports with `${DATABASE_PORT:-5432}:5432` for `postgres` and `${TEST_DATABASE_PORT:-5433}:5432` for `postgres-test`, matching the existing API pattern of `${PORT:-3000}:3000`.

Rationale: Compose interpolation is already used for the API port. With one root `.env`, Compose can resolve runtime and test service ports from the same default source without service-specific includes or CLI `--env-file` flags.

Alternatives considered:

- Separate compose files per worktree: rejected because it creates unnecessary configuration drift for a local ergonomics problem.
- Hardcode additional example services: rejected because it does not scale beyond the examples and complicates the canonical workflow.
- Service-level `env_file: .env.test` on `postgres-test` only: rejected because it configures the container environment but does not feed Compose interpolation for `ports`.
- Compose `include` long syntax with `.env.test`: rejected because a single root `.env` is simpler for local development and avoids introducing a Docker Compose version dependency for `include`.

### Treat `COMPOSE_PROJECT_NAME` as host Compose configuration

`COMPOSE_PROJECT_NAME` will be documented in dotenv examples and runbook snippets for parallel worktrees, but it will not be added to container `environment` blocks.

Rationale: Docker Compose reads `COMPOSE_PROJECT_NAME` before creating project resources. Passing it to containers would not isolate networks, containers, or volumes.

Alternatives considered:

- Rely on directory names only: rejected because worktree directory naming can still collide or be hard to reason about during experiments.
- Rename Compose services dynamically: rejected because service names are part of the local workflow and docs.

### Consolidate local defaults into `.env.example`

`.env.example` will document all non-secret local defaults: `COMPOSE_PROJECT_NAME`, `PORT`, `DATABASE_PORT`, `DATABASE_URL`, `TEST_DATABASE_PORT`, and `TEST_DATABASE_URL`. Contributors can copy it to `.env` for host runtime, migrations, Compose interpolation, and PostgreSQL integration tests. The committed `.env.test` file will be removed so there is only one local dotenv example to keep in sync.

Rationale: the `TEST_` prefix keeps destructive test configuration visibly separate while allowing Compose and the test harness to read the same root `.env` values. This removes the earlier mismatch between Compose interpolation and `.env.test`.

Alternatives considered:

- Keep `.env.test`: rejected because it requires either duplicated port defaults, CLI `--env-file`, or Compose include configuration for a local-only workflow.
- Require exported shell variables only: rejected because committed non-secret examples should remain the discoverable local contract.

### Keep database URLs explicit

`.env.example` and runbook examples will show `DATABASE_URL` and `TEST_DATABASE_URL` with host ports that match `DATABASE_PORT` and `TEST_DATABASE_PORT`.

Rationale: the existing dotenv usage does not expand variables inside URL values. Explicit URLs avoid adding a new dependency and make the destructive test database target visible.

Alternatives considered:

- Compose database URLs from `DATABASE_PORT` and `TEST_DATABASE_PORT`: rejected because it would require adding variable expansion behavior that is not currently present.
- Derive URLs in TypeScript: rejected because local host command configuration should stay simple and transparent.

## Risks / Trade-offs

- Port variables and URL ports can drift -> Document each port variable next to the matching explicit database URL and validate default and non-default Compose output.
- Putting test defaults in root `.env` can be mistaken as runtime configuration -> Keep `TEST_` prefixes and docs explicit that PostgreSQL integration tests are destructive for `TEST_DATABASE_URL` only.
- Contributors may expect `COMPOSE_PROJECT_NAME` inside `services.environment` to isolate resources -> Document it as a Compose-level variable, not a container runtime variable.
- Parallel worktrees can still collide if they reuse the same project name or host ports -> Include concrete examples with distinct API, runtime DB, and test DB ports.
- Existing local `.env` files will not update automatically -> Preserve defaults and document the new optional variables so existing single-worktree setups keep working.
