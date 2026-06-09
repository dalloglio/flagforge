# PRD: add-docker-and-ci

## Problem

FlagForge already uses PostgreSQL persistence, but local development and CI need a reproducible way to run the app, database, migrations, tests, build, and container build checks. Without a shared Docker and CI foundation, contributors can pass checks in one environment while failing in another.

## Goals

- Provide a reproducible local development setup for the API and PostgreSQL using Docker and Docker Compose.
- Make database migrations runnable and verifiable in the local containerized workflow.
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
- Docker Compose must start PostgreSQL with configuration suitable for local development and automated tests.
- The local workflow must support applying migrations before running app or test checks that depend on PostgreSQL.
- GitHub Actions must run on pull requests and verify the same core gates expected locally: typecheck, lint, format check, tests, build, strict OpenSpec validation, and Docker build.
- CI failures must clearly identify which gate failed so contributors can reproduce and fix issues locally.
- The workflow must not require cloud services, production credentials, or non-local infrastructure.

## Risks

- CI may become slow if database setup, migrations, tests, and Docker build are not staged efficiently.
- Local and CI configuration can drift if Docker Compose and GitHub Actions use different environment defaults.
- Migration checks can give false confidence if they only run against an already-initialized database.

## Open questions

- Should CI run the full existing `npm run verify` script directly, or split gates into separate jobs for clearer failure reporting?
- Should the Docker image target production runtime only, or also include a development target for Compose?
- What exact migration command should be treated as the canonical local and CI gate?
