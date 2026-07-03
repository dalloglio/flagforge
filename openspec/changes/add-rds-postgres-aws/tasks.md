## 1. IaC Structure

- [ ] 1.1 Add a reusable OpenTofu module for RDS PostgreSQL under `infra/aws/modules/`.
- [ ] 1.2 Define module inputs for non-secret database configuration, network references, tags, backup, encryption, maintenance, monitoring, and deletion-protection settings.
- [ ] 1.3 Define only non-secret or explicitly sensitive module outputs needed by future deployment work, such as endpoint, port, database name, username reference, password reference, and network dependency references.
- [ ] 1.4 Add Terragrunt live composition for the first non-production `dev` RDS PostgreSQL target.

## 2. Application Contract Compatibility

- [ ] 2.1 Verify the RDS target remains compatible with the existing FlagForge PostgreSQL schema and migration path.
- [ ] 2.2 Document local PostgreSQL versus AWS RDS differences for connection source, credential source, TLS expectation, migration execution, network reachability, and environment settings.
- [ ] 2.3 Confirm no application API, domain, flag evaluation, audit-log, OpenAPI, or public behavior changes are introduced.

## 3. Security, LGPD, and Operations Documentation

- [ ] 3.1 Document RDS network exposure assumptions and avoid public database exposure as the default access pattern.
- [ ] 3.2 Document secrets handling as references or future secret-management integration points without committed real credentials or account-specific values.
- [ ] 3.3 Document cost drivers, expected development-sized assumptions, and cleanup or rollback expectations.
- [ ] 3.4 Document backup retention, encryption, deletion protection, maintenance window, parameter group, monitoring, and logging expectations or explicit deferrals.
- [ ] 3.5 Update or add runbook guidance that distinguishes code rollback, resource cleanup, state recovery, and data-preserving remediation.

## 4. Validation and Guardrails

- [ ] 4.1 Add or update IaC formatting and static validation documentation or wrappers without adding AWS credentials to default verification.
- [ ] 4.2 Confirm `npm run verify` remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, live RDS instances, and cloud provisioning.
- [ ] 4.3 Confirm default package scripts, Makefile targets, CI workflows, runbooks, and documentation do not run account-backed plan, apply, destroy, import, or state-mutating IaC commands.
- [ ] 4.4 Run OpenSpec strict validation for the change.
- [ ] 4.5 Run repository formatting checks and the standard verification gate, documenting any IaC CLI prerequisites or intentionally separate checks.

## 5. Review Readiness

- [ ] 5.1 Prepare Staff review notes for cloud database architecture, module/live boundaries, and application contract compatibility.
- [ ] 5.2 Prepare SRE review notes for cost, operations, rollback, cleanup, validation, and failure modes.
- [ ] 5.3 Prepare Security/LGPD review notes for network access, credentials, generated artifacts, data minimization, tags, and outputs.
- [ ] 5.4 Prepare QA review notes for validation strategy and local-to-AWS database compatibility.
