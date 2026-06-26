## Context

FlagForge already has a local Docker runtime, PostgreSQL persistence, operational endpoints, and local Helm packaging. ADR 0006 establishes the Level 1 local platform path before cloud work, ADR 0008 selects kind for local Kubernetes, and ADR 0009 selects Helm for Kubernetes packaging.

This change adds a reproducible kind workflow for local Kubernetes practice. It should make the API run in a local cluster by composing existing platform building blocks rather than introducing application runtime changes.

## Goals / Non-Goals

**Goals:**

- Provide source-controlled kind configuration for a local FlagForge cluster.
- Document the setup, deploy, smoke validation, and reset path through thin Makefile/documentation wrappers.
- Run FlagForge in kind using the existing image, Helm chart, in-cluster PostgreSQL dependency, and operational endpoints.
- Keep kind validation as an explicit Level 1 platform check outside `npm run verify`.

**Non-Goals:**

- Production Kubernetes design.
- AWS/EKS infrastructure.
- Argo CD, Kong, Prometheus/Grafana, or alerting.
- Changes to public API behavior or domain/application code.

## Decisions

### Use kind as a documented local simulation target

The workflow will create a named kind cluster using source-controlled configuration under an infrastructure-oriented path such as `infra/kind/`. This follows ADR 0008 and keeps cluster setup separate from application source.

Alternative considered: rely on ad hoc `kind create cluster` commands only. That would be simpler initially but less reproducible for parallel work and later platform layers.

### Use source-controlled config with thin wrappers

Cluster lifecycle and deployment entrypoints will be exposed through documented commands or thin Makefile targets that call kind, kubectl, and Helm directly. The durable behavior should live in source-controlled kind configuration, Helm values, and documentation rather than opaque shell scripts.

Alternative considered: add a single large orchestration script. That would make the first workflow convenient but would hide the platform steps this change is meant to teach and make troubleshooting harder.

### Deploy the API through Helm rather than raw manifests

The kind workflow will use the existing local Helm chart as the deployable API package. This preserves the Helm decision in ADR 0009 and avoids creating a competing Kubernetes manifest path.

Alternative considered: add raw Kubernetes YAML for kind. That would duplicate chart behavior and make later GitOps work harder to reason about.

### Run PostgreSQL inside kind for the first workflow

The first kind workflow will run PostgreSQL inside the local kind cluster using local-safe credentials and documented migration steps before API readiness is expected to pass. This aligns with ADR 0005 and ADR 0006 while keeping PostgreSQL packaging separate from the existing API Helm chart. The FlagForge API should still be deployed through its Helm chart, with `DATABASE_URL` pointing at the in-cluster PostgreSQL service through local values or documented secret creation.

Alternative considered: depend on the host Docker Compose PostgreSQL service from inside kind. That would reduce Kubernetes work in this change but would make smoke validation depend on host networking details and would weaken the Level 1 local platform boundary.

### Keep validation explicit and platform-scoped

Validation will be provided through documented commands or Makefile targets that require Docker, kind, kubectl, and Helm. These checks will not become part of the host-only `npm run verify` gate.

Alternative considered: add kind smoke checks to `npm run verify`. That would make normal application verification depend on a running Docker/Kubernetes environment and slow down unrelated code work.

## Risks / Trade-offs

- [Risk] kind workflows can be sensitive to local Docker state and host ports. -> Mitigation: document prerequisites, reset commands, and troubleshooting steps.
- [Risk] API startup can fail if PostgreSQL, migrations, or secrets are not prepared correctly in the cluster. -> Mitigation: make database configuration, secret creation, and migration prerequisites explicit in the local workflow.
- [Risk] The workflow may be mistaken for production readiness. -> Mitigation: state prominently in the runbook that kind is a Level 1 local simulation and not production Kubernetes.
- [Risk] Parallel worktrees can collide on cluster names or ports. -> Mitigation: use a documented default cluster name and explain how to override names or reset local state.

## Migration Plan

No runtime migration is required. Add the kind configuration, in-cluster PostgreSQL dependency path, thin command wrappers, and docs. Validate locally with the documented smoke path after migrations have run, and remove the local cluster with the documented reset command when finished.

## Open Questions

- None. Current direction is source-controlled kind configuration, thin Makefile/documentation wrappers, Helm-centered API deployment, and in-cluster PostgreSQL for the first local kind workflow.
