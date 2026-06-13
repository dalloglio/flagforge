## Context

FlagForge already has a Docker Compose workflow with three local services: `app`, `postgres`, and `postgres-test`. The API host port is parameterized with `PORT`, but the runtime and test PostgreSQL host ports are fixed at `5432` and `5433`. That works for one checkout, but it blocks parallel worktree experiments because each Compose project tries to bind the same host ports.

The project also loads `.env` for host runtime and migration entrypoints, and `.env.test` for PostgreSQL integration tests. Those files currently use explicit PostgreSQL URLs, which is compatible with the existing dotenv loader and keeps database targets reviewable.

## Goals / Non-Goals

**Goals:**

- Preserve the default local workflow on API port `3000`, runtime PostgreSQL port `5432`, and test PostgreSQL port `5433`.
- Allow each worktree to choose distinct host ports through `PORT`, `DATABASE_PORT`, and `TEST_DATABASE_PORT`.
- Document `COMPOSE_PROJECT_NAME` so Compose resources are isolated per worktree.
- Keep runtime and integration test database URLs explicit and aligned with the selected host ports.
- Keep migrations as an explicit host command before running the Compose app service.

**Non-Goals:**

- Do not change public API behavior, persistence semantics, database schema, or migration behavior.
- Do not add new dependencies such as dotenv variable expansion.
- Do not introduce automatic migration execution in the app container.
- Do not change production deployment configuration or add Kubernetes/Helm behavior.

## Decisions

### Use Compose variable interpolation for host ports

`docker-compose.yml` will map host ports with `${DATABASE_PORT:-5432}:5432` for `postgres` and `${TEST_DATABASE_PORT:-5433}:5432` for `postgres-test`, matching the existing API pattern of `${PORT:-3000}:3000`.

Rationale: Compose interpolation is already used for the API port, keeps defaults local and non-secret, and avoids duplicating compose files for each worktree.

Alternatives considered:

- Separate compose files per worktree: rejected because it creates unnecessary configuration drift for a local ergonomics problem.
- Hardcode additional example services: rejected because it does not scale beyond the examples and complicates the canonical workflow.

### Treat `COMPOSE_PROJECT_NAME` as host Compose configuration

`COMPOSE_PROJECT_NAME` will be documented in dotenv examples and runbook snippets for parallel worktrees, but it will not be added to container `environment` blocks.

Rationale: Docker Compose reads `COMPOSE_PROJECT_NAME` before creating project resources. Passing it to containers would not isolate networks, containers, or volumes.

Alternatives considered:

- Rely on directory names only: rejected because worktree directory naming can still collide or be hard to reason about during experiments.
- Rename Compose services dynamically: rejected because service names are part of the local workflow and docs.

### Keep database URLs explicit

`.env.example`, `.env.test`, and runbook examples will show `DATABASE_URL` and `TEST_DATABASE_URL` with host ports that match `DATABASE_PORT` and `TEST_DATABASE_PORT`.

Rationale: the existing dotenv usage does not expand variables inside URL values. Explicit URLs avoid adding a new dependency and make the destructive test database target visible.

Alternatives considered:

- Compose database URLs from `DATABASE_PORT` and `TEST_DATABASE_PORT`: rejected because it would require adding variable expansion behavior that is not currently present.
- Derive URLs in TypeScript: rejected because local host command configuration should stay simple and transparent.

## Risks / Trade-offs

- Port variables and URL ports can drift -> Document them together in examples and add tasks to update both dotenv files and runbooks.
- Contributors may expect `COMPOSE_PROJECT_NAME` inside `services.environment` to isolate resources -> Document it as a Compose-level variable, not a container runtime variable.
- Parallel worktrees can still collide if they reuse the same project name or host ports -> Include concrete examples with distinct API, runtime DB, and test DB ports.
- Existing local `.env` files will not update automatically -> Preserve defaults and document the new optional variables so existing single-worktree setups keep working.
