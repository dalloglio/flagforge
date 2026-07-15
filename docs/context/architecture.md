# Architecture Context

## Current runtime boundaries

- `src/server.ts` starts the Express server.
- `src/api/` owns HTTP routing, request validation, dependency wiring, and transport error mapping.
- `src/application/` owns feature flag and audit-log use case orchestration.
- `src/domain/` owns flag types, Zod schemas, repository contracts, audit event construction, and evaluation rules.
- `src/infrastructure/postgres/` owns PostgreSQL configuration, migrations, repository adapters, and transaction support.
- `src/infrastructure/telemetry/` owns OpenTelemetry configuration, SDK
  startup, and HTTP/Express instrumentation.
- `test/` mirrors API, domain, and PostgreSQL persistence boundaries with Supertest and Vitest coverage.

## Architectural direction

FlagForge uses a pragmatic hexagonal architecture and DDD-lite direction:

- Domain code does not depend on Express, PostgreSQL, Kong, OpenTelemetry,
  Kubernetes, or cloud infrastructure.
- API code translates HTTP requests into application/domain operations and
  owns transport-level authentication, rate limiting, and metrics boundaries.
- Infrastructure concerns are implemented behind focused adapters or startup
  modules when an active OpenSpec change requires them.
- Abstractions should exist only when they remove real complexity or protect an actual boundary.

## Persistence model

The current runtime persistence path is PostgreSQL. Local development uses Docker Compose with non-secret defaults, versioned SQL migrations, and a Node.js migration runner. In-memory repositories remain available only as explicit test doubles for focused tests.

The completed Level 1 path also runs PostgreSQL inside kind. The Level 3 RDS
PostgreSQL module is a statically validated contract that still requires real
network, account, identity, secret, and state handoffs before live use.

SQLite is not the future persistence target for this project.

## Platform state

Level 1 local platform practice is implemented at its documented local scope:

- Docker and Docker Compose provide PostgreSQL, the API, Kong, Prometheus, and
  Grafana workflows.
- kind provides resettable local Kubernetes practice with PostgreSQL and the API.
- Helm packages the API workload and supports local-safe or existing Secrets.
- local Argo CD desired state and runbooks define GitOps sync, drift, and cleanup.
- Kong provides local DB-less gateway routing.
- Prometheus/Grafana provide local metrics and a basic dashboard.
- OpenTelemetry provides optional local HTTP tracing with console export only.

Level 3 foundations/contracts are source controlled under `infra/aws/`:

- OpenTofu modules and Terragrunt `dev` composition represent static RDS
  PostgreSQL, EKS, and ALB contracts.
- a guarded GitHub Actions workflow represents the ECR publication path but is
  disabled until external prerequisites are configured.
- AWS GitOps manifests represent `dev` desired state and manual-sync policy.
- validation is credential-free and static by default. No real AWS account,
  resource provisioning, ECR push, kubeconfig, live Argo CD sync, or continuous
  service operation is evidenced.

The Helm chart and AWS desired-state values are deployment contracts, not proof
of a deployed production service. Detailed evidence classifications and
limitations live in `docs/project-status.md`.

## Guardrails

- Use OpenSpec before public behavior changes.
- Do not alter API contracts without specs and tests.
- Do not introduce additional persistence or platform behavior before an active change requests it.
- Keep `src/` and `test/` untouched for documentation-only workflow foundation changes.
- Keep AWS IaC validation separate from account-backed `plan`, `apply`,
  `destroy`, import, state mutation, remote state, and credentialed cloud access
  until a future OpenSpec change introduces those workflows.
- Keep RDS, EKS, and ALB networking as externally supplied references until future AWS networking and remote-state changes provide real VPC, subnet, and security-group outputs.
- Keep EKS IAM/OIDC, node roles, ALB controller identity, kubeconfig generation, and live-cluster access as future reviewed workflows; current EKS/ALB contracts use static references only.
- Keep optional OpenTelemetry Collector, OTLP/vendor export, production SLOs,
  alerting, and AWS observability outside the current evidence claim.
