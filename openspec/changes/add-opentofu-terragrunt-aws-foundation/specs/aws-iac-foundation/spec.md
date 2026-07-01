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

#### Scenario: Apply commands are not automatic

- **WHEN** a contributor inspects package scripts, Makefile targets, CI workflows, and IaC documentation added by this change
- **THEN** no default, CI, or verification command runs `tofu apply`, `terragrunt apply`, or an equivalent provisioning command
- **AND** any future apply workflow is identified as out of scope for this change

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
- **THEN** it states that future AWS resource changes must document expected cost impact and cleanup or rollback steps
- **AND** it requires explicit review before adding resources that can incur cloud cost

#### Scenario: Scope limits are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that this foundation does not create EKS, RDS, ECR, ALB, production deployment, Atlantis, Terrareg, or automatic apply workflows
- **AND** it describes the foundation as preparation for future Level 3 AWS changes rather than production readiness
