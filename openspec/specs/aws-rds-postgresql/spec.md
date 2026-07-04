## Purpose

Define the source-controlled AWS RDS PostgreSQL infrastructure contract, application compatibility expectations, and validation guardrails for future AWS database work.

## Requirements

### Requirement: Represent AWS RDS PostgreSQL in IaC

FlagForge SHALL provide a source-controlled AWS RDS PostgreSQL target through the selected OpenTofu and Terragrunt IaC workflow.

#### Scenario: RDS target lives in AWS infrastructure

- **WHEN** a contributor inspects the repository
- **THEN** RDS PostgreSQL IaC exists in an infrastructure-oriented path such as `infra/aws/`
- **AND** the RDS IaC is not embedded in application runtime source under `src/`

#### Scenario: Module and live composition are separated

- **WHEN** a contributor inspects the RDS PostgreSQL IaC
- **THEN** reusable OpenTofu module code is separated from Terragrunt live environment composition
- **AND** the live composition identifies the first target as a non-production AWS learning environment
- **AND** the live composition is documented as a static contract target rather than an account-backed plan or apply target until future networking, account, and remote-state changes provide real dependencies

#### Scenario: RDS uses PostgreSQL engine

- **WHEN** a contributor inspects the RDS database definition
- **THEN** the managed database target uses the PostgreSQL engine
- **AND** the database name and engine configuration are documented without committing real account-specific values or secrets

#### Scenario: RDS consumes external network references

- **WHEN** a contributor inspects the RDS PostgreSQL module and live composition
- **THEN** VPC, subnet, route table, NAT gateway, internet gateway, and security group resources are not created by this change
- **AND** required network dependencies are represented as inputs, references, documented future outputs, or clearly marked non-sensitive mock outputs for static validation only
- **AND** any mock network outputs are documented as invalid for real account-backed plan or apply workflows

### Requirement: Preserve the application PostgreSQL contract

FlagForge SHALL keep the AWS RDS PostgreSQL target compatible with the existing application PostgreSQL persistence contract.

#### Scenario: Application behavior remains unchanged

- **WHEN** this change is implemented
- **THEN** public API behavior, domain behavior, flag evaluation, audit-log behavior, and OpenAPI contracts remain unchanged
- **AND** any AWS-specific database configuration stays outside application domain logic

#### Scenario: RDS target uses existing migration path

- **WHEN** documentation describes preparing the RDS PostgreSQL database for FlagForge
- **THEN** it identifies the existing versioned PostgreSQL migration path as the schema compatibility baseline
- **AND** it does not define a separate AWS-only schema or migration model

#### Scenario: Local and AWS database differences are documented

- **WHEN** a contributor reads the RDS PostgreSQL documentation
- **THEN** it explains the differences between local PostgreSQL and AWS RDS for connection source, credential source, TLS expectation, migration execution, network reachability, and environment-specific settings

### Requirement: Define safe database configuration handoff

FlagForge SHALL document non-secret database references that future AWS deployment work can consume without redefining the database contract.

#### Scenario: Future deployment references are documented

- **WHEN** a contributor reads the RDS PostgreSQL documentation or IaC outputs
- **THEN** it identifies the database endpoint, port, database name, username reference, password reference, and network dependency references needed by future deployment work
- **AND** it avoids committing real credential values, generated secrets, or personal workstation configuration

#### Scenario: RDS master credential uses managed password reference

- **WHEN** a contributor inspects the RDS PostgreSQL module, live composition, documentation, variables, and outputs
- **THEN** the first target uses an RDS-managed master password or equivalent generated secret reference
- **AND** no database password value is accepted as committed example configuration, output in plaintext, or required in a real `.tfvars` file
- **AND** any managed secret ARN or equivalent reference exposed for future deployment work is treated as a sensitive output or sensitive generated artifact

#### Scenario: Secret values are not committed

- **WHEN** a contributor inspects committed RDS PostgreSQL examples, configuration, variables, outputs, and documentation
- **THEN** they do not contain real passwords, copied cloud tokens, profile names from a personal workstation, SSO URLs, real AWS account IDs, production-only identifiers, or personal data
- **AND** secret values are represented as references or future secret-management integration points

#### Scenario: Sensitive generated artifacts stay out of source control

- **WHEN** a contributor inspects source-controlled RDS PostgreSQL files
- **THEN** OpenTofu and Terragrunt state files, plan files, command logs, generated provider files, generated module caches, real `.tfvars` values, and sensitive outputs are not committed

### Requirement: Document RDS security and LGPD guardrails

FlagForge SHALL document the security and LGPD assumptions for the AWS RDS PostgreSQL target before implementation is considered complete.

#### Scenario: Network exposure is constrained

- **WHEN** a contributor reads the RDS PostgreSQL documentation or reviews the IaC
- **THEN** the database network model is documented
- **AND** public database exposure is not presented as the default access pattern

#### Scenario: Data minimization applies to examples and metadata

- **WHEN** a contributor inspects RDS PostgreSQL examples, names, tags, variables, outputs, and documentation
- **THEN** they avoid personal data, customer data, secrets, real account IDs, production-only identifiers, and LGPD-relevant data unless a future reviewed change explicitly requires them

#### Scenario: Security review gates are documented

- **WHEN** a contributor reads the RDS PostgreSQL planning or implementation documentation
- **THEN** it identifies Staff, SRE, Security/LGPD, and QA review expectations for cloud database architecture, operations, credentials, generated artifacts, and validation strategy

### Requirement: Document RDS cost and operations expectations

FlagForge SHALL document cost drivers, operational assumptions, and cleanup or rollback expectations for the AWS RDS PostgreSQL target.

#### Scenario: Cost assumptions are explicit

- **WHEN** a contributor reads the RDS PostgreSQL documentation
- **THEN** it identifies expected cost drivers such as instance class, storage, backup retention, monitoring, data transfer, and cleanup expectations
- **AND** it describes the first target as development-sized or learning-focused unless a future reviewed change makes it production-oriented

#### Scenario: Operational settings are documented

- **WHEN** a contributor reads the RDS PostgreSQL documentation or reviews the IaC
- **THEN** backup retention, encryption, deletion protection, maintenance window, parameter group, monitoring, and logging expectations are documented or explicitly deferred with rationale
- **AND** final snapshot naming avoids reusing a fixed identifier across repeated reviewed cleanup workflows, either by generating a unique identifier per DB instance lifecycle or by requiring an explicit cleanup-time identifier

#### Scenario: Rollback and cleanup are documented

- **WHEN** a contributor reads the RDS PostgreSQL runbook or implementation documentation
- **THEN** it distinguishes code rollback, planned resource cleanup, state recovery, and data-preserving remediation
- **AND** it does not imply that code rollback alone removes live RDS resources or protects database data

### Requirement: Keep validation and provisioning workflows separate

FlagForge SHALL keep static validation, account-backed planning, and provisioning workflows operationally separate for the AWS RDS PostgreSQL target.

#### Scenario: Default verification does not require AWS access

- **WHEN** a contributor runs the repository default verification gate
- **THEN** it does not require AWS credentials, remote state, a live RDS instance, account-backed plans, or cloud provisioning

#### Scenario: Static validation is documented separately

- **WHEN** a contributor reads the RDS PostgreSQL documentation
- **THEN** it identifies any OpenTofu or Terragrunt formatting and static validation commands separately from default repository verification
- **AND** it explains that missing local IaC CLIs are local prerequisite issues, not reasons to add cloud credentials

#### Scenario: Account-backed commands are explicit

- **WHEN** a contributor inspects package scripts, Makefile targets, CI workflows, runbooks, and RDS PostgreSQL documentation
- **THEN** default commands do not run `tofu plan`, `terragrunt plan`, `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `terragrunt run-all apply`, `terragrunt run-all destroy`, `tofu import`, `tofu state rm`, `tofu force-unlock`, `tofu taint`, or equivalent account-backed, destructive, or state-mutating commands
- **AND** any future use of those commands is documented as explicit human-reviewed workflow rather than automatic verification
