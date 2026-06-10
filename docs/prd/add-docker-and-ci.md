# PRD: add-docker-and-ci

## Problem

FlagForge already uses PostgreSQL persistence, but local development and CI need a reproducible way to run the app, database, migrations, tests, build, and container build checks. Without a shared Docker and CI foundation, contributors can pass checks in one environment while failing in another.

## Goals

- Provide a reproducible local development setup for the API and PostgreSQL using Docker and Docker Compose.
- Make database migrations runnable, explicit, and verifiable in the local containerized workflow.
- Ensure CI verifies typecheck, lint, formatting, tests, build, migrations, and Docker image build.
- Keep the workflow simple enough for contributors to run the same meaningful checks before opening a PR.

## Non-goals

- Helm, kind, Argo CD, Kong, AWS, or production deployment.
- OpenAPI generation or API contract expansion.
- Observability, tracing, metrics, dashboards, or alerting.
- Authentication, authorization, tenancy, environments, SDKs, or segment management.

## Users

- Developers building and testing FlagForge locally.
- Contributors preparing pull requests.
- Reviewers validating that the project can be built and tested from a clean environment.

## Requirements

- The repository must include Docker assets to build and run the FlagForge API.
- The Docker image must use a version-pinned Node base image, production runtime dependencies, a non-root runtime user, and the compiled `node dist/src/server.js` entrypoint.
- Docker Compose must start PostgreSQL with configuration suitable for local development and automated tests.
- The local workflow must support applying migrations through the canonical `npm run db:migrate` command before running app or test checks that depend on PostgreSQL.
- The local workflow must include a documented `/health` smoke check for the running Compose app service.
- `npm run verify` must remain a host-only completion gate that does not require Docker or PostgreSQL; PostgreSQL integration tests, Docker build, and Compose smoke checks must remain explicit commands.
- GitHub Actions must run on pull requests and verify the same host-only gates expected locally plus explicit CI-only gates for PostgreSQL migrations, PostgreSQL integration tests, build, strict OpenSpec validation, and Docker build.
- CI failures must clearly identify which gate failed so contributors can reproduce and fix issues locally.
- CI steps must call canonical repository scripts or documented Docker commands instead of duplicating tool internals in workflow YAML.
- The workflow must not require cloud services, production credentials, or non-local infrastructure.

## Risks

- CI may become slow if database setup, migrations, tests, and Docker build are not staged efficiently.
- Local and CI configuration can drift if Docker Compose and GitHub Actions use different environment defaults.
- Migration checks can give false confidence if they only run against an already-initialized database.
- Floating container base image tags can make builds change without a repository diff.
- CI can become brittle if workflow YAML hard-codes test runner or migration internals instead of invoking project commands.

## Resolved decisions

- CI will use named steps for clear failure reporting while calling canonical repository commands.
- The Docker image targets production runtime only; Compose will run that image with PostgreSQL.
- `npm run db:migrate` is the canonical local and CI migration gate.
- Migrations remain explicit and are not run automatically by the app container.
