## MODIFIED Requirements

### Requirement: AWS IaC foundation structure

FlagForge SHALL provide a source-controlled OpenTofu and Terragrunt foundation for Level 3 AWS infrastructure work.

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
- **THEN** the foundation documentation distinguishes the original foundation-only validation module from the RDS PostgreSQL resource contract and the EKS and ALB runtime contract introduced by reviewed changes
- **AND** the RDS PostgreSQL module is described as a static, reviewable infrastructure contract that still does not authorize default account-backed plan, apply, destroy, import, or state-mutating workflows
- **AND** the EKS and ALB modules are described as static, reviewable runtime infrastructure contracts that still do not authorize production deployment, default account-backed plan, apply, destroy, import, state-mutating workflows, kubeconfig generation, cluster-admin access, or live-cluster workflows
- **AND** ECR repository provisioning, production deployment, Atlantis, Terrareg, remote state, IAM/OIDC automation, networking resources, and automatic apply workflows remain out of scope unless a future OpenSpec change introduces them
