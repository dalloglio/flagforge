## Why

FlagForge now depends on PostgreSQL for runtime persistence, so local development and CI need a reproducible way to build the app, run the database, apply migrations, execute tests, and verify container builds. This change reduces drift between contributor machines and CI while keeping the current API and domain behavior unchanged.

## What Changes

- Add production Docker support for the TypeScript/Express API with a reproducible, version-pinned Dockerfile, a non-root runtime user, production dependencies only, and `.dockerignore`.
- Add Docker Compose support for running the API with a local PostgreSQL service using documented non-secret development defaults, explicit migrations, and a documented health smoke check.
- Add or update environment documentation so local Docker, migration, app, and test workflows use explicit variables without committing secrets.
- Add or update Makefile wrappers for local development, migrations, quality gates, build, Docker build, and Docker Compose workflows while keeping npm scripts as the source commands.
- Add or update npm scripts needed for build, migration execution, unit tests, integration tests, and verification while keeping `npm run verify` focused on checks that do not require Docker or PostgreSQL.
- Expand GitHub Actions so CI installs dependencies, validates OpenSpec, runs lint, format check, typecheck, migrations, unit tests, integration tests, build, and Docker image build with PostgreSQL available as a service container, using repository scripts instead of duplicating tool internals.
- Update README and the local-development runbook with the new Docker, database, migration, test, and CI workflow.
- Do not add deployment, registry publishing, Kubernetes, Helm, kind, Argo CD, Kong, OpenAPI, observability, authentication, authorization, tenancy, environments, SDKs, or segment management.

## Capabilities

### New Capabilities

- `containerized-runtime`: Defines Docker image and Docker Compose requirements for running FlagForge with PostgreSQL in local development and verification workflows.

### Modified Capabilities

- `ci-quality`: Expands repository quality gates, scripts, Makefile wrappers, and GitHub Actions requirements to include build, Docker build, PostgreSQL service setup, migrations, unit tests, and integration tests.

## Impact

- Affected files are expected to include Docker assets, Docker Compose configuration, environment examples, package scripts, Makefile targets, GitHub Actions workflows, README documentation, and `docs/runbooks/local-development.md`.
- CI will require PostgreSQL service configuration, explicit migration execution before persistence-dependent integration tests, and a Docker image build without registry publishing.
- The change must preserve the public API contract, domain rules, PostgreSQL persistence semantics, and secret-handling rules.
