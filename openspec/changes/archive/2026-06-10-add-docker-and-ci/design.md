## Context

FlagForge is a TypeScript/Express ESM package whose runtime persistence path is PostgreSQL. The repository already includes a PostgreSQL migration runner (`npm run db:migrate`), a focused PostgreSQL integration test script (`npm run test:postgres`), a Docker Compose PostgreSQL service, and a GitHub Actions workflow that runs OpenSpec validation, typecheck, lint, format check, and unit tests.

This change adds the missing delivery foundation around those pieces: a production container image for the API, a complete local Docker Compose workflow for app plus PostgreSQL, documented environment defaults, command wrappers, build scripts, and CI gates that prove migrations, integration tests, compiled output, and Docker image construction. The work must not alter the public API contract, domain behavior, persistence semantics, or introduce deployment infrastructure.

## Goals / Non-Goals

**Goals:**

- Provide a production-oriented Dockerfile for the FlagForge API that builds TypeScript and runs the compiled ESM server with production dependencies, a version-pinned Node base image, and a non-root runtime user.
- Provide Docker Compose configuration that can run PostgreSQL and the API together with non-secret local defaults, while keeping database migrations as an explicit command before app startup.
- Document required environment variables in `.env.example`, README, and a local-development runbook.
- Add thin Makefile and npm script wrappers for build, migrations, unit tests, PostgreSQL integration tests, Docker build, Docker Compose startup, smoke checks, and verification.
- Update GitHub Actions so CI uses PostgreSQL as a service container, applies migrations, runs unit and integration tests, runs build, and verifies Docker image build through named steps that call canonical repository commands.
- Keep CI failure output easy to diagnose by using named steps for each gate.

**Non-Goals:**

- No Helm chart, kind cluster, Argo CD, Kong configuration, AWS deployment, registry publish, or image promotion.
- No OpenAPI generation, observability, tracing, metrics, dashboards, or alerting.
- No authentication, authorization, tenancy, environments, SDKs, or segment management.
- No public API, domain-rule, or data-model behavior changes.
- No committed secrets or production credentials.

## Decisions

### Use a Production-Only Multi-Stage Dockerfile

The Dockerfile will use an explicitly versioned Node Alpine base, install dependencies with `npm ci`, compile TypeScript into `dist/`, prune or install production dependencies for the runtime stage, create or use a non-root runtime user, and run `node dist/src/server.js`.

Rationale: the current package is ESM and `tsconfig.json` preserves the source directory structure under `dist/`, so the compiled server entrypoint is `dist/src/server.js`. Running that explicit compiled entrypoint keeps the image focused on production runtime behavior and avoids relying on `tsx` or `package.json#main` in production. Pinning the Node major/minor image tag reduces build drift while still allowing a future dedicated dependency-maintenance change to advance runtime versions.

Alternatives considered:

- Development Docker target with `tsx watch`: useful for local iteration, but it adds Dockerfile complexity and is not required for CI or production image verification.
- Single-stage image with all dev dependencies: simpler to write, but larger and less clearly production-oriented.
- Floating `node:lts-alpine`: convenient, but less reproducible and harder to reason about when CI behavior changes unexpectedly.

### Extend Docker Compose Instead of Replacing It

The existing `postgres` service will remain the local database foundation. Compose will add an `app` service that builds the Dockerfile, depends on PostgreSQL health, receives `DATABASE_URL` through environment configuration, and exposes the Express port. Migrations will remain an explicit prerequisite through the canonical `npm run db:migrate` command, surfaced by Makefile and documentation, before starting the app service.

Rationale: the PostgreSQL service already matches the accepted local persistence direction. Extending it keeps existing local database workflows intact while adding a full app-plus-database path.

Alternatives considered:

- Create a separate compose file for the app: reduces impact on the existing database-only workflow, but fragments local setup for a small project.
- Run migrations automatically from Compose before the app starts: convenient, but can hide the migration gate and blur app/database responsibilities. The canonical migration command should remain explicit through npm and Makefile wrappers, while CI runs it as a named step.

### Treat `DATABASE_URL` and `TEST_DATABASE_URL` as Canonical Environment Inputs

`.env.example`, README, CI, and runbook documentation will use `DATABASE_URL` for runtime and migration commands and `TEST_DATABASE_URL` for PostgreSQL integration tests. Non-secret local defaults may use the existing `flagforge` username, password, and database name.

Rationale: the current PostgreSQL config validates URL-shaped inputs and integration tests already fall back from `TEST_DATABASE_URL` to `DATABASE_URL`. Keeping these names avoids adding configuration surfaces.

Alternatives considered:

- Split host, port, database, user, and password variables: more flexible, but inconsistent with the existing parser and more error-prone for contributors.

### Split CI Gates Into Named Steps With a PostgreSQL Service Container

GitHub Actions will keep one quality workflow but add a PostgreSQL service container with a health check. Steps will install dependencies, validate OpenSpec directly, run lint, format check, typecheck, migrations, unit tests, integration tests, build, and Docker build. The workflow will call npm scripts and documented Docker commands rather than duplicating Vitest, TypeScript, or migration internals in YAML.

Rationale: separate named steps make failures easy to reproduce while keeping the workflow small. The service container provides a clean database per job so migrations and integration tests do not rely on developer state.

Alternatives considered:

- Run only `npm run verify`: matches the local completion gate, but gives less precise CI failure names and intentionally does not include Docker or PostgreSQL-dependent checks.
- Split every gate into separate jobs: maximizes isolation, but duplicates setup and slows a small repository without clear benefit.

### Keep Makefile Targets as Thin Wrappers

The Makefile will call npm scripts, OpenSpec validation, Docker, and Docker Compose commands directly without redefining behavior. `npm run verify` remains the local completion gate for host-only checks that do not require Docker or PostgreSQL. Additional targets will expose database, migration, build, integration test, Docker build, Compose startup, and a local health smoke check.

Rationale: repository guidance already treats npm scripts and OpenSpec commands as source commands. Thin wrappers improve ergonomics without creating another source of truth.

Alternatives considered:

- Move workflow logic into Makefile recipes: useful for complex orchestration, but increases drift risk and weakens the npm-script contract.

## Risks / Trade-offs

- CI duration increases from PostgreSQL startup, migration execution, integration tests, TypeScript build, and Docker build -> keep one service container and one workflow job, and avoid unnecessary image publish or deployment work.
- Local and CI defaults can drift -> document the same `DATABASE_URL` and `TEST_DATABASE_URL` shapes in `.env.example`, README, runbook, Compose, and workflow configuration.
- Migrations can pass against a reused local database while failing on a clean one -> CI will run migrations against a fresh PostgreSQL service database.
- Docker Compose app startup can race PostgreSQL readiness -> keep PostgreSQL health checks and make the app service depend on the healthy database service.
- Production image can accidentally include local files or dev-only artifacts -> use `.dockerignore`, multi-stage build, and production dependency install/prune in the runtime stage.
- Docker images can run with unnecessary privileges -> run the runtime stage as a non-root user and avoid copying local environment files or credentials into the image.
- CI can couple to fragile implementation details -> keep CI steps named, but call repository scripts and documented Docker commands instead of hard-coding tool-specific internals.

## Migration Plan

1. Add or update scripts and wrappers without changing runtime code paths.
2. Add Dockerfile, `.dockerignore`, `.env.example`, and Compose app configuration.
3. Update CI to run PostgreSQL service setup, migrations, integration tests, build, and Docker build as named gates.
4. Update README and create `docs/runbooks/local-development.md` with local Docker, migration, test, and verification instructions.
5. Verify with the local quality gate and any focused Docker, PostgreSQL, and `/health` smoke checks that are practical in the environment.

Rollback is straightforward because this change only affects delivery assets, scripts, documentation, and CI configuration. Reverting those files restores the previous local and CI workflow without requiring data migration or API rollback.

## Resolved Questions

- `npm run verify` remains the local completion gate for host-only checks and MUST NOT require Docker or PostgreSQL. CI will run additional named gates for migrations, PostgreSQL integration tests, build, and Docker image build.
- Docker Compose will run only the API container and database in this change. Migrations remain explicit through `npm run db:migrate` and thin Makefile/documentation wrappers.
