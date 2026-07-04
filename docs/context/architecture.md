# Architecture Context

## Current runtime boundaries

- `src/server.ts` starts the Express server.
- `src/api/` owns HTTP routing, request validation, dependency wiring, and transport error mapping.
- `src/application/` owns feature flag and audit-log use case orchestration.
- `src/domain/` owns flag types, Zod schemas, repository contracts, audit event construction, and evaluation rules.
- `src/infrastructure/postgres/` owns PostgreSQL configuration, migrations, repository adapters, and transaction support.
- `test/` mirrors API, domain, and PostgreSQL persistence boundaries with Supertest and Vitest coverage.

## Architectural direction

FlagForge uses a pragmatic hexagonal architecture and DDD-lite direction:

- Domain code does not depend on Express, PostgreSQL, Kong, OpenTelemetry, Kubernetes, or cloud infrastructure.
- API code translates HTTP requests into application/domain operations.
- Infrastructure concerns should be introduced behind focused adapters when an active OpenSpec change requires them.
- Abstractions should exist only when they remove real complexity or protect an actual boundary.

## Persistence model

The current runtime persistence path is PostgreSQL. Local development uses Docker Compose with non-secret defaults, versioned SQL migrations, and a Node.js migration runner. In-memory repositories remain available only as explicit test doubles for focused tests.

The future platform path is PostgreSQL inside kind for local platform simulation and later RDS PostgreSQL for the AWS target.

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

Level 3 AWS work is a future target architecture, not current runtime implementation. The repository has an `infra/aws/` OpenTofu/Terragrunt foundation for future AWS work. It includes static-validation scaffolding plus an RDS PostgreSQL contract target for reviewable database architecture, but default workflows still do not provision cloud resources.

## Guardrails

- Use OpenSpec before public behavior changes.
- Do not alter API contracts without specs and tests.
- Do not introduce additional persistence or platform behavior before an active change requests it.
- Keep `src/` and `test/` untouched for documentation-only workflow foundation changes.
- Keep AWS IaC validation separate from account-backed `plan`, `apply`, `destroy`, import, state mutation, remote state, and credentialed cloud access until a future OpenSpec change introduces those workflows.
- Keep RDS networking as externally supplied references until future AWS networking and remote-state changes provide real VPC, subnet, and security-group outputs.
