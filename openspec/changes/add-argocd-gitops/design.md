## Context

FlagForge has selected a local-first platform path before cloud delivery. ADR 0009 selects Helm for Kubernetes packaging, and ADR 0010 selects Argo CD for GitOps delivery first locally and later in EKS. This change proposes the local Argo CD layer that should sit on top of the local Kubernetes and Helm workflow.

The goal is to make Git the desired-state source for the local FlagForge deployment without changing application runtime behavior.

## Goals / Non-Goals

**Goals:**

- Add local Argo CD setup and validation documentation.
- Add a source-controlled desired-state entrypoint for the FlagForge local application.
- Use the existing Helm chart as the application deployment source.
- Document sync, health, drift, and rollback-oriented local workflows.

**Non-Goals:**

- AWS/EKS GitOps implementation.
- Production promotion, multi-environment release strategy, or progressive delivery.
- Secrets management beyond local-safe configuration.
- Changes to FlagForge API behavior or application source code.

## Decisions

### Represent FlagForge desired state with an Argo CD Application

The change will add a local Argo CD Application definition or equivalent source-controlled entrypoint in an infrastructure-oriented path. It will point at the local FlagForge Helm chart and values intended for Level 1 platform practice.

Alternative considered: document only `argocd app create` CLI commands. CLI-only setup is useful for learning, but without a source-controlled desired-state artifact it weakens the GitOps model.

### Keep GitOps configuration separate from runtime code

Argo CD manifests and docs will live under infrastructure or documentation paths, not under `src/`. The API process must remain unaware of Argo CD.

Alternative considered: add runtime feature toggles for GitOps detection. That creates coupling with the delivery platform and provides no application behavior value.

### Treat validation as platform-specific

Argo CD validation will be a documented local workflow, not part of `npm run verify`. The validation path will rely on local Kubernetes and Argo CD being available.

Alternative considered: make GitOps sync validation part of the standard verification gate. That would make normal code verification dependent on local cluster state and remote-like reconciliation behavior.

## Risks / Trade-offs

- [Risk] Argo CD setup depends on local Kubernetes readiness and Helm chart correctness. -> Mitigation: document prerequisites and sequence after local kind/Helm validation.
- [Risk] Desired-state paths can become brittle across worktrees or forks. -> Mitigation: document repository URL/path assumptions and local override options where implementation supports them.
- [Risk] Local secrets can leak into committed desired state. -> Mitigation: require local-safe defaults and document secret handling without committing real secrets.
- [Risk] This could be mistaken for production GitOps design. -> Mitigation: scope docs and specs to Level 1 local practice only.

## Migration Plan

No application data or API migration is required. Add the local Argo CD desired-state files and docs, validate sync/health in a local cluster, and remove the local Argo CD application through documented cleanup steps when needed.

## Open Questions

- Should implementation install Argo CD as part of the local workflow, or assume a documented Argo CD installation step?
- Should the desired-state entrypoint point directly to the feature branch during local validation, or document the branch/revision override explicitly?
