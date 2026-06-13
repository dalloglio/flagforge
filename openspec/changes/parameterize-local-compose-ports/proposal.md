## Why

FlagForge contributors need to experiment with parallel worktrees while running the API and both PostgreSQL services locally. The current Compose and dotenv defaults reserve fixed host ports, which prevents multiple local stacks from running side by side without manual Compose edits.

## What Changes

- Parameterize the local Compose host port for the runtime PostgreSQL service with `DATABASE_PORT`, defaulting to `5432`.
- Parameterize the local Compose host port for the PostgreSQL integration test service with `TEST_DATABASE_PORT`, defaulting to `5433`.
- Document `COMPOSE_PROJECT_NAME` as part of the local environment contract so parallel worktrees receive separate Compose project names, networks, containers, and volumes.
- Keep API port behavior unchanged by preserving `PORT=3000` as the default while documenting per-worktree overrides such as `3017`, `3018`, and `3019`.
- Keep `DATABASE_URL` and `TEST_DATABASE_URL` explicit, with docs explaining that they must point at the selected host ports because local dotenv loading does not compose URLs from other variables.
- Update local environment examples and runbook guidance for default and parallel-worktree workflows.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `containerized-runtime`: Local Compose and environment documentation must support configurable API, runtime PostgreSQL, and test PostgreSQL host ports for parallel worktrees while preserving the existing default ports.

## Impact

- Affected configuration: `.env.example`, `.env.test`, and `docker-compose.yml`.
- Affected documentation: `docs/runbooks/local-development.md` and any README Docker workflow references that mention fixed ports.
- Affected specs: `openspec/specs/containerized-runtime/spec.md` through the delta spec for this change.
- No public API behavior, persistence semantics, database schema, dependencies, or production runtime behavior should change.
