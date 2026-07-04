## Purpose

Define the source-controlled AWS IaC foundation, local validation boundaries, and guardrails for future Level 3 OpenTofu and Terragrunt infrastructure work.

## Requirements

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

#### Scenario: Foundation distinguishes scaffold and resource contract modules

- **WHEN** this change is implemented
- **THEN** the foundation documentation distinguishes the original foundation-only validation module from the RDS PostgreSQL resource contract introduced by this change
- **AND** the RDS PostgreSQL module is described as a static, reviewable infrastructure contract that still does not authorize default account-backed plan, apply, destroy, import, or state-mutating workflows
- **AND** EKS, ECR, ALB, production deployment, Atlantis, Terrareg, remote state, IAM/OIDC automation, networking resources, and automatic apply workflows remain out of scope unless a future OpenSpec change introduces them

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
- **AND** it states that local AWS profile names are optional placeholders for future account-backed workflows and are not required for credential-free validation
- **AND** it states that profile names, SSO URLs, account IDs, credentials, and personal workstation configuration must not be committed in `.env`, `.tfvars`, backend configuration, provider files, generated Terragrunt files, or examples

#### Scenario: Sensitive data minimization is explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that examples, variables, outputs, tags, resource names, and documentation must avoid personal data, customer data, secrets, real account IDs, production-only identifiers, and LGPD-relevant data unless a future reviewed change explicitly requires them
- **AND** it states that outputs must not expose secrets or sensitive values
- **AND** it states that placeholder values must be clearly non-sensitive examples

#### Scenario: State plans logs and outputs are sensitive artifacts

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that OpenTofu/Terragrunt state files, plan files, command logs, generated provider files, and outputs can expose sensitive infrastructure metadata or LGPD-relevant configuration
- **AND** it requires those artifacts to stay out of source control unless a future reviewed change explicitly permits a safe example artifact
- **AND** it requires future remote-state or account-backed workflow changes to document retention, access control, encryption, and disposal expectations for generated IaC artifacts

#### Scenario: Least privilege is required for future IAM and OIDC

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that future IAM/OIDC changes must use least-privilege policies, scoped trust relationships, short-lived credentials, and environment-specific roles
- **AND** it states that administrator policies, wildcard permissions, broad principals, long-lived access keys, and shared personal credentials must not be used as defaults
- **AND** it requires Security/LGPD review before any IAM/OIDC, CI plan, or apply-capable workflow is introduced

#### Scenario: Mandatory tags are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it defines a mandatory baseline tag convention for future AWS resources, including project, environment, managed-by, ownership, and cost-allocation metadata or documented equivalents
- **AND** it states that tag values must not contain personal data, secrets, customer data, real account IDs, or production-only identifiers in examples
- **AND** it requires future resource-producing changes to show how mandatory tags are applied or explain why a resource cannot support them

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
- **THEN** it describes a future sequencing checkpoint for AWS work that keeps account or remote-state bootstrap, networking, RDS plan/apply readiness, EKS or ALB, and observability changes reviewable as separate follow-up changes
- **AND** it explains that this RDS change defines the database contract before real network dependencies are available
- **AND** it requires Staff, SRE, and Security/LGPD review before remote state, IAM/OIDC, real AWS resources, account-backed plans, or apply-capable automation are introduced

#### Scenario: Scope limits are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that the foundation now includes an RDS PostgreSQL contract module only when this change is implemented
- **AND** it states that the committed RDS live composition is not a plan/apply-ready cloud environment until future account, networking, and remote-state changes provide real dependencies
- **AND** it describes the foundation as preparation for future Level 3 AWS changes rather than production readiness
