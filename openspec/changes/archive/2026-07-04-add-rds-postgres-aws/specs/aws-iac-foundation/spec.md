## MODIFIED Requirements

### Requirement: AWS IaC foundation structure

FlagForge SHALL provide a source-controlled OpenTofu and Terragrunt foundation
for future Level 3 AWS infrastructure work.

#### Scenario: AWS IaC files live outside application source

- **WHEN** a contributor inspects the repository
- **THEN** AWS IaC foundation files exist in an infrastructure-oriented path such
  as `infra/aws/`
- **AND** the files are not embedded in application runtime source under `src/`

#### Scenario: Modules and live composition are separated

- **WHEN** a contributor inspects the AWS IaC foundation
- **THEN** reusable OpenTofu module code is separated from Terragrunt live
  environment composition
- **AND** the live composition path identifies environment and region conventions
  for future AWS work

#### Scenario: Foundation distinguishes scaffold and resource contract modules

- **WHEN** this change is implemented
- **THEN** the foundation documentation distinguishes the original
  foundation-only validation module from the RDS PostgreSQL resource contract
  introduced by this change
- **AND** the RDS PostgreSQL module is described as a static, reviewable
  infrastructure contract that still does not authorize default account-backed
  plan, apply, destroy, import, or state-mutating workflows
- **AND** EKS, ECR, ALB, production deployment, Atlantis, Terrareg, remote state,
  IAM/OIDC automation, networking resources, and automatic apply workflows
  remain out of scope unless a future OpenSpec change introduces them

### Requirement: AWS IaC guardrails documentation

FlagForge SHALL document guardrails for future AWS IaC changes before
resource-producing work begins.

#### Scenario: Future AWS resource sequencing is documented

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it describes a future sequencing checkpoint for AWS work that keeps
  account or remote-state bootstrap, networking, RDS plan/apply readiness, EKS
  or ALB, and observability changes reviewable as separate follow-up changes
- **AND** it explains that this RDS change defines the database contract before
  real network dependencies are available
- **AND** it requires Staff, SRE, and Security/LGPD review before remote state,
  IAM/OIDC, real AWS resources, account-backed plans, or apply-capable
  automation are introduced

#### Scenario: Scope limits are explicit

- **WHEN** a contributor reads the AWS IaC foundation documentation
- **THEN** it states that the foundation now includes an RDS PostgreSQL contract
  module only when this change is implemented
- **AND** it states that the committed RDS live composition is not a
  plan/apply-ready cloud environment until future account, networking, and
  remote-state changes provide real dependencies
- **AND** it describes the foundation as preparation for future Level 3 AWS
  changes rather than production readiness
