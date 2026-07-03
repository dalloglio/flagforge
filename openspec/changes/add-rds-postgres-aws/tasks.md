## 1. IaC Structure

- [x] 1.1 Add a reusable OpenTofu module for RDS PostgreSQL under `infra/aws/modules/`.
- [x] 1.2 Define module inputs for non-secret database configuration, network references, tags, backup, encryption, maintenance, monitoring, and deletion-protection settings.
- [x] 1.3 Keep VPC, subnet, route table, NAT gateway, internet gateway, and security-group resources out of scope; model network dependencies as required inputs, documented future outputs, or clearly marked non-sensitive mock outputs for static validation only.
- [x] 1.4 Configure the first target to use an RDS-managed master password or equivalent generated secret reference; do not accept or commit a database password value in examples, variables, `.tfvars`, outputs, or documentation.
- [x] 1.5 Define only non-secret or explicitly sensitive module outputs needed by future deployment work, such as endpoint, port, database name, username reference, managed secret reference, and network dependency references.
- [x] 1.6 Add Terragrunt live composition for the first non-production `dev` RDS PostgreSQL contract target and document that it is not account-backed plan/apply-ready until future networking, account, and remote-state changes provide real dependencies.

## 2. Application Contract Compatibility

- [x] 2.1 Verify the RDS target remains compatible with the existing FlagForge PostgreSQL schema and migration path.
- [x] 2.2 Document local PostgreSQL versus AWS RDS differences for connection source, credential source, TLS expectation, migration execution, network reachability, and environment settings.
- [x] 2.3 Confirm no application API, domain, flag evaluation, audit-log, OpenAPI, or public behavior changes are introduced.

## 3. Security, LGPD, and Operations Documentation

- [x] 3.1 Document RDS network exposure assumptions and avoid public database exposure as the default access pattern.
- [x] 3.2 Document secrets handling as references or future secret-management integration points without committed real credentials or account-specific values.
- [x] 3.3 Document the RDS-managed master password reference pattern, including how future deployment work may consume the managed secret reference without exposing the password.
- [x] 3.4 Document cost drivers, expected development-sized assumptions, and cleanup or rollback expectations.
- [x] 3.5 Document backup retention, encryption, deletion protection, maintenance window, parameter group, monitoring, and logging expectations or explicit deferrals.
- [x] 3.6 Update or add runbook guidance that distinguishes code rollback, resource cleanup, state recovery, and data-preserving remediation.
- [x] 3.7 Update AWS foundation documentation to distinguish the previous zero-resource foundation from the new RDS contract target and to keep networking, remote state, account-backed plan/apply, and provisioning workflows explicitly separate.

## 4. Validation and Guardrails

- [x] 4.1 Add or update IaC formatting and static validation documentation or wrappers without adding AWS credentials to default verification.
- [x] 4.2 Confirm `npm run verify` remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, live RDS instances, and cloud provisioning.
- [x] 4.3 Confirm default package scripts, Makefile targets, CI workflows, runbooks, and documentation do not run account-backed plan, apply, destroy, import, or state-mutating IaC commands.
- [x] 4.4 Run OpenSpec strict validation for the change.
- [x] 4.5 Run repository formatting checks and the standard verification gate, documenting any IaC CLI prerequisites or intentionally separate checks.

## 5. Review Readiness

- [x] 5.1 Prepare Staff review notes for cloud database architecture, module/live boundaries, and application contract compatibility.
- [x] 5.2 Prepare SRE review notes for cost, operations, rollback, cleanup, validation, and failure modes.
- [x] 5.3 Prepare Security/LGPD review notes for network access, credentials, generated artifacts, data minimization, tags, and outputs.
- [x] 5.4 Prepare QA review notes for validation strategy and local-to-AWS database compatibility.
