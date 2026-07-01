## ADDED Requirements

### Requirement: AWS IaC foundation structure

FlagForge SHALL provide a source-controlled OpenTofu and Terragrunt foundation for future Level 3 AWS infrastructure work.

#### Scenario: AWS IaC files live outside application source

- **WHEN** a contributor inspects the repository
- **THEN** AWS IaC foundation files exist in an infrastructure-oriented path such as `infra/aws/`
- **AND** the files are not embedded in application runtime source under `src/`

#### Scenario: Modules and live composition are separated

- **WHEN** a contributor inspects the AWS IaC foundation
- **THEN** reusable OpenTofu module code is separated from Terragrunt live environment composition
- **AND** the live composition path identifies environment and region conventions for future AWS work

#### Scenario: Foundation does not declare managed AWS resources

- **WHEN** this change is implemented
- **THEN** the committed foundation does not create EKS, RDS, ECR, ALB, or other managed AWS resources
- **AND** any placeholder or example files are clearly identified as foundation-only inputs for future changes

### Requirement: Credential-free static validation

FlagForge SHALL provide local IaC validation commands for the AWS foundation that do not require AWS credentials or real cloud resources.

#### Scenario: Formatting and static checks are documented

- **WHEN** a contributor reads the AWS IaC documentation
- **THEN** it identifies the OpenTofu and Terragrunt formatting or static validation commands for the foundation
- **AND** it explains which CLI prerequisites are needed locally

#### Scenario: Validation does not require AWS credentials

- **WHEN** a contributor runs the documented foundation validation commands from a workstation without AWS credentials
- **THEN** the commands can complete without a live AWS account, remote state bucket, or committed backend credentials
- **AND** failures identify missing local CLIs or malformed local files rather than missing cloud access

#### Scenario: Validation remains outside the host-only verify gate

- **WHEN** a contributor inspects repository verification scripts
- **THEN** `npm run verify` does not require OpenTofu, Terragrunt, AWS credentials, remote state, or cloud access
- **AND** IaC validation is available through separate documented commands or thin wrappers

### Requirement: No automatic provisioning

FlagForge SHALL prevent this foundation change from introducing automatic cloud provisioning behavior.

#### Scenario: Validate plan and apply are separate workflow classes

- **WHEN** a contributor reads the AWS IaC foundation documentation and validation commands
- **THEN** credential-free validation is described as formatting, local HCL checks, OpenTofu validation without backend access where supported, documentation checks, or OpenSpec validation
- **AND** account-backed `plan` workflows are identified as future work that requires a separate OpenSpec change
- **AND** `apply` workflows are identified as future work that requires explicit human review and a separate OpenSpec change

#### Scenario: Apply commands are not automatic

- **WHEN** a contributor inspects package scripts, Makefile targets, CI workflows, and IaC documentation added by this change
- **THEN** no default, CI, or verification command runs `tofu apply`, `terragrunt apply`, or an equivalent provisioning command
- **AND** any future apply workflow is identified as out of scope for this change

#### Scenario: Dangerous IaC commands are not hidden behind default wrappers

- **WHEN** a contributor inspects package scripts, Makefile targets, CI workflows, runbooks, and IaC documentation added by this change
- **THEN** no default, CI, or verification command runs `tofu plan`, `terragrunt plan`, `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `terragrunt run-all apply`, `terragrunt run-all destroy`, `tofu import`, `tofu state rm`, `tofu force-unlock`, `tofu taint`, or an equivalent account-backed, destructive, or state-mutating command
- **AND** no default, CI, or verification command includes `--auto-approve`
- **AND** documentation presents any future account-backed or state-mutating command as out of scope for this foundation rather than as a current procedure

#### Scenario: CI does not provision AWS resources

- **WHEN** repository CI or documented local gates run for this change
- **THEN** they do not require AWS credentials
- **AND** they do not create, update, or destroy AWS resources

### Requirement: AWS IaC guardrails documentation

FlagForge SHALL document guardrails for future AWS IaC changes before resource-producing work begins.

#### Scenario: State and backend assumptions are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it describes remote state and backend assumptions as future work or explicit prerequisites
- **AND** it does not require committed state files, backend credentials, or personal AWS credentials

#### Scenario: Secrets and identity assumptions are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that secrets, personal AWS credentials, production kubeconfigs, and copied cloud tokens must not be committed
- **AND** it identifies IAM/OIDC and secret management as future resource-producing design topics

#### Scenario: Cost guardrails are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that this foundation has zero expected AWS cost because it does not create cloud resources
- **AND** it states that future AWS resource changes must document expected cost impact and cleanup or rollback steps
- **AND** it requires explicit review before adding resources that can incur cloud cost

#### Scenario: Future remote state bootstrap is explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that remote state bootstrap is a future resource-producing change
- **AND** it requires that future remote-state work define ownership, locking, encryption, versioning, access control, recovery, state migration, and lock-failure handling before use

#### Scenario: Rollback expectations are explicit for future resources

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that future AWS resource-producing changes must document rollback or cleanup steps before implementation is considered complete
- **AND** it distinguishes code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation as separate concerns where applicable

#### Scenario: AWS IaC operations runbook exists

- **WHEN** a contributor inspects the repository documentation for this foundation
- **THEN** an AWS IaC operations runbook or runbook section exists
- **AND** it documents prerequisites, credential-free validation, common local validation failures, commands that must not be run by default, no-resource verification, rollback or cleanup expectations for future resource-producing changes, and escalation guidance

#### Scenario: Future AWS resource sequencing is documented

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it describes a future sequencing checkpoint for AWS work that keeps account or remote-state bootstrap, low-risk initial resources such as ECR, networking, RDS, EKS or ALB, and observability changes reviewable as separate follow-up changes
- **AND** it requires Staff, SRE, and Security/LGPD review before remote state, IAM/OIDC, real AWS resources, or apply-capable automation are introduced

#### Scenario: Scope limits are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that this foundation does not create EKS, RDS, ECR, ALB, production deployment, Atlantis, Terrareg, or automatic apply workflows
- **AND** it describes the foundation as preparation for future Level 3 AWS changes rather than production readiness
