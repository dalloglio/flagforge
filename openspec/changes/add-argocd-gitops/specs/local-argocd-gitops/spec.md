## ADDED Requirements

### Requirement: Local Argo CD desired state

FlagForge SHALL provide source-controlled desired-state configuration for deploying the local FlagForge application with Argo CD.

#### Scenario: Argo CD application configuration is source controlled

- **WHEN** a contributor inspects the repository
- **THEN** local Argo CD application configuration exists in an infrastructure-oriented path
- **AND** the configuration is not embedded in application source under `src/`

#### Scenario: Desired state uses Helm packaging

- **WHEN** the local Argo CD application configuration is reviewed
- **THEN** it points to the FlagForge Helm chart and local values intended for Level 1 platform practice
- **AND** it does not define a competing raw Kubernetes deployment for the API workload
- **AND** it relies on the existing local kind and Helm packaging workflow instead of reimplementing local deployment primitives in Argo CD-specific manifests

#### Scenario: Target revision strategy is documented

- **WHEN** a contributor reviews the local Argo CD desired-state artifact and documentation
- **THEN** the reusable desired-state artifact uses a mainline-safe default repository revision
- **AND** the documentation explains how to validate an unmerged feature branch by overriding the local Argo CD application target revision to a pushed branch name or commit SHA
- **AND** branch-specific or worktree-specific revisions are not required to be committed to the reusable desired-state artifact

### Requirement: Local Argo CD sync workflow

FlagForge SHALL document how to install or access local Argo CD and sync the FlagForge application in the local Kubernetes environment.

#### Scenario: Sync documentation exists

- **WHEN** a contributor reads the local GitOps documentation
- **THEN** it explains how to prepare local Kubernetes through the existing kind/Helm workflow, make Argo CD available, apply the FlagForge application definition, and sync the application
- **AND** it identifies required CLIs or access methods such as kubectl and Argo CD CLI or UI access

#### Scenario: Application health can be inspected

- **WHEN** a contributor follows the documented local GitOps workflow
- **THEN** they can inspect the FlagForge application sync and health status through Argo CD
- **AND** the documentation explains the expected healthy local state

#### Scenario: GitOps workflow remains local-only

- **WHEN** a contributor reads the local GitOps documentation
- **THEN** it states that the workflow is Level 1 local platform practice
- **AND** it does not claim AWS, EKS, production promotion, or production rollout support

### Requirement: Local GitOps validation

FlagForge SHALL provide a validation path that proves local Argo CD can reconcile the FlagForge desired state.

#### Scenario: Sync validation proves desired state applies

- **WHEN** local Kubernetes and Argo CD are running
- **THEN** the documented validation path proves the FlagForge application reaches a synced state or reports actionable sync failure details

#### Scenario: Runtime validation proves API remains reachable

- **WHEN** the local Argo CD application is synced and healthy
- **THEN** the documented validation path proves a FlagForge operational endpoint such as `GET /healthz` or `GET /readyz` is reachable through the local access path

#### Scenario: GitOps validation remains outside verify

- **WHEN** a contributor inspects the verification scripts
- **THEN** `npm run verify` does not require Argo CD, a running Kubernetes cluster, Docker, Helm, PostgreSQL services, or synced applications
- **AND** GitOps validation is available through separate documented commands or Makefile targets

### Requirement: Local GitOps operations documentation

FlagForge SHALL document local GitOps operations for sync, drift inspection, rollback-oriented recovery, and cleanup.

#### Scenario: Drift and resync guidance exists

- **WHEN** a contributor reads the local GitOps documentation
- **THEN** it explains how to inspect local drift and trigger or observe resync for the FlagForge application

#### Scenario: Cleanup guidance exists

- **WHEN** a contributor reads the local GitOps documentation
- **THEN** it explains how to remove the local Argo CD application or reset local GitOps state without affecting production systems

#### Scenario: Local-safe secret guidance exists

- **WHEN** a contributor reads the local GitOps documentation
- **THEN** it explains how local-safe runtime configuration is provided
- **AND** it warns contributors not to commit production secrets or personal credentials
- **AND** it states that local-safe secret handling is not a production secrets strategy
