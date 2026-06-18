## Why

FlagForge needs a local GitOps delivery path after local Kubernetes packaging exists so contributors can practice desired-state deployment before any cloud work. Argo CD is the accepted GitOps tool for the project, and this change keeps that practice within the Level 1 local platform boundary.

## What Changes

- Add local Argo CD setup documentation for the FlagForge local Kubernetes workflow.
- Add a source-controlled Argo CD Application definition or equivalent local desired-state entrypoint for FlagForge.
- Define how the local Argo CD desired state references the repository branch or revision, including feature-branch validation without committing local-only branch names.
- Document sync, health, drift, and rollback validation for the local application path.
- Keep secrets handling limited to local-safe configuration and avoid production promotion workflows.
- Keep AWS/EKS, production rollout, complex multi-environment promotion, and cloud-specific GitOps concerns out of scope.

## Capabilities

### New Capabilities

- `local-argocd-gitops`: Requirements for representing FlagForge desired state locally, syncing it with Argo CD, and validating local GitOps behavior.

### Modified Capabilities

- None.

## Impact

- Affected systems: local platform documentation, Argo CD application configuration, GitOps validation workflow, and Kubernetes desired-state repository layout.
- Affected existing capabilities: the workflow should depend on the existing local kind and Helm packaging behavior without reimplementing deployment primitives or changing the FlagForge API contract.
- API impact: no public FlagForge API contract changes are expected.
- Dependency impact: Argo CD CLI or local Argo CD access may become prerequisites for optional GitOps validation.
