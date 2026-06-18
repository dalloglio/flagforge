## Context

FlagForge has selected a local-first platform path before cloud delivery. ADR 0009 selects Helm for Kubernetes packaging, and ADR 0010 selects Argo CD for GitOps delivery first locally and later in EKS. This change proposes the local Argo CD layer that should sit on top of the local Kubernetes and Helm workflow.

The goal is to make Git the desired-state source for the local FlagForge deployment without changing application runtime behavior.

## Goals / Non-Goals

**Goals:**

- Add local Argo CD setup and validation documentation.
- Add a source-controlled desired-state entrypoint for the FlagForge local application.
- Use the existing Helm chart as the application deployment source.
- Define the repository branch or revision strategy for local and feature-branch validation.
- Document sync, health, drift, and rollback-oriented local workflows.

**Non-Goals:**

- AWS/EKS GitOps implementation.
- Production promotion, multi-environment release strategy, or progressive delivery.
- Secrets management beyond local-safe configuration. Local-safe secret handling is not a production secrets strategy.
- Changes to FlagForge API behavior or application source code.

## Decisions

### Represent FlagForge desired state with an Argo CD Application

The change will add a local Argo CD Application definition or equivalent source-controlled entrypoint in an infrastructure-oriented path. It will point at the local FlagForge Helm chart and values intended for Level 1 platform practice. The desired-state artifact is the primary setup source; CLI commands may apply, patch, sync, or inspect it, but should not be the only place where desired state exists.

Alternative considered: document only `argocd app create` CLI commands. CLI-only setup is useful for learning, but without a source-controlled desired-state artifact it weakens the GitOps model.

### Make branch and revision handling explicit

The source-controlled Application should use a mainline-safe default revision for durable desired state and documentation should explain how contributors validate an unmerged feature branch by overriding `spec.source.targetRevision` to a pushed branch name or commit SHA for their local Argo CD application. Branch-specific or worktree-specific revisions should not be committed to the reusable desired-state artifact.

Alternative considered: commit the active feature branch in the Application manifest. That helps one PR validation run, but makes the desired state brittle across forks, worktrees, and later mainline use.

### Depend on the existing kind and Helm workflow

The Argo CD workflow should assume the local kind cluster and Helm chart workflow are already available and should reconcile that Helm chart. It should not introduce separate raw Kubernetes deployment manifests for the FlagForge API workload or duplicate local cluster bootstrap behavior already owned by the kind/Helm path.

Alternative considered: provide Argo CD-specific Kubernetes workload manifests. That would bypass ADR 0009's Helm packaging decision and split the local deployment model.

### Keep GitOps configuration separate from runtime code

Argo CD manifests and docs will live under infrastructure or documentation paths, not under `src/`. The API process must remain unaware of Argo CD.

Alternative considered: add runtime feature toggles for GitOps detection. That creates coupling with the delivery platform and provides no application behavior value.

### Treat validation as platform-specific

Argo CD validation will be a documented local workflow, not part of `npm run verify`. The validation path will rely on local Kubernetes and Argo CD being available.

Alternative considered: make GitOps sync validation part of the standard verification gate. That would make normal code verification dependent on local cluster state and remote-like reconciliation behavior.

## Risks / Trade-offs

- [Risk] Argo CD setup depends on local Kubernetes readiness and Helm chart correctness. -> Mitigation: document prerequisites and sequence after local kind/Helm validation.
- [Risk] Desired-state paths or revisions can become brittle across worktrees, forks, or feature branches. -> Mitigation: use a durable default revision and document local target revision overrides for branch or SHA validation.
- [Risk] Local secrets can leak into committed desired state or be mistaken for a production pattern. -> Mitigation: require local-safe defaults and document secret handling without committing real secrets or claiming production secret management.
- [Risk] This could be mistaken for production GitOps design. -> Mitigation: scope docs and specs to Level 1 local practice only.

## Migration Plan

No application data or API migration is required. Add the local Argo CD desired-state files and docs, validate sync/health in a local cluster, and remove the local Argo CD application through documented cleanup steps when needed.

## Open Questions

- Should implementation install Argo CD as part of the local workflow, or assume a documented Argo CD installation step?
