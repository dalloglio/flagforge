# Architecture Context

## Current runtime boundaries

- `src/server.ts` starts the Express server.
- `src/api/` owns HTTP routing, request validation, dependency wiring, and transport error mapping.
- `src/domain/` owns flag types, Zod schemas, repository behavior, audit-log behavior, and evaluation rules.
- `test/` mirrors the API and domain boundaries with Supertest and Vitest coverage.

## Architectural direction

FlagForge uses a pragmatic hexagonal architecture and DDD-lite direction:

- Domain code does not depend on Express, PostgreSQL, Kong, OpenTelemetry, Kubernetes, or cloud infrastructure.
- API code translates HTTP requests into application/domain operations.
- Infrastructure concerns should be introduced behind focused adapters when an active OpenSpec change requires them.
- Abstractions should exist only when they remove real complexity or protect an actual boundary.

## Persistence direction

The current MVP intentionally uses in-memory storage. The accepted persistence target is PostgreSQL, first through Docker Compose, then inside kind for local platform simulation, and later RDS PostgreSQL for the AWS target.

SQLite is not the future persistence target for this project.

## Platform direction

Level 1 local platform work will simulate operational delivery locally before cloud work:

- Docker and Docker Compose where useful.
- kind for local Kubernetes.
- Helm for Kubernetes packaging.
- Argo CD for local GitOps.
- Kong as a self-hosted API gateway.
- PostgreSQL in the local platform.
- OpenTelemetry, Prometheus, and Grafana for observability.

Level 3 AWS work is a future target architecture, not current implementation.

## Guardrails

- Use OpenSpec before public behavior changes.
- Do not alter API contracts without specs and tests.
- Do not introduce persistence or platform behavior before the active change requests it.
- Keep `src/` and `test/` untouched for documentation-only workflow foundation changes.
