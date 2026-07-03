# PRD: add-rds-postgres-aws

## Problem

FlagForge already uses PostgreSQL as its runtime persistence model and has an
OpenTofu/Terragrunt foundation for future AWS work. The Level 3 AWS target
architecture needs a managed PostgreSQL path so later EKS, deployment, migration,
and operations changes can depend on an explicit database target instead of
inventing database assumptions inside application deployment work.

Without an RDS PostgreSQL product requirement, future AWS changes may mix
database architecture, networking, secrets, cost, migration expectations, and
application configuration into unrelated delivery increments. That would make
the platform path harder to review and could weaken the existing application
database contract.

## Goals

- Define the AWS RDS PostgreSQL target for FlagForge.
- Preserve compatibility with the existing local PostgreSQL application
  contract.
- Keep application feature behavior unchanged.
- Keep RDS networking as an explicit dependency on future AWS networking outputs;
  do not create VPC, subnet, route table, NAT gateway, internet gateway, or
  security-group resources in this change.
- Establish a safe first credential contract using an RDS-managed master password
  or equivalent generated secret reference, without committed password values.
- Document configuration, migration, cost, security, LGPD, and operational
  expectations before implementation.
- Provide a clear handoff surface for future AWS deployment work that needs
  database connection outputs or references.
- Keep credential-free static validation separate from future account-backed
  plan and apply workflows.

## Non-goals

- EKS deployment.
- ALB, ingress, or production traffic routing.
- Application feature changes.
- Public API contract changes.
- Multi-region or cross-region database design.
- Database read replicas.
- Production data migration.
- VPC, subnet, route table, NAT gateway, internet gateway, security-group,
  IAM/OIDC, account bootstrap, or remote-state bootstrap resources.
- Backup restore drills beyond documenting expectations.
- Automatic CI provisioning or destructive cloud operations.
- Authentication, authorization, tenancy, environments, SDKs, or segment
  management.

## Users

- Contributors implementing Level 3 AWS infrastructure changes.
- Developers validating that FlagForge keeps the same PostgreSQL contract across
  local and AWS targets.
- Staff reviewers assessing cloud database architecture and application boundary
  compatibility.
- SRE reviewers assessing operability, cost visibility, backup expectations,
  migration path, and rollback or cleanup behavior.
- Security and LGPD reviewers assessing network exposure, credentials, state,
  plans, logs, secrets, and data handling assumptions.
- QA reviewers assessing validation strategy for cloud database integration.
- Future deployment changes that need to consume database connection references.

## Requirements

- OpenSpec artifacts must define the RDS PostgreSQL behavior before
  implementation under the requested change id `add-rds-postgres-aws`.
- The AWS PostgreSQL target must be represented through the selected
  OpenTofu/Terragrunt IaC workflow.
- RDS IaC must live in the AWS infrastructure area, such as `infra/aws/`, and
  must not be embedded in `src/` application runtime code.
- Reusable module code and environment composition must remain separated in the
  AWS IaC structure.
- The first `dev` live composition must be documented as a static contract target
  and not as account-backed plan/apply-ready until future networking, account,
  and remote-state changes provide real dependencies.
- The RDS module must not create VPCs, subnets, route tables, NAT gateways,
  internet gateways, or security groups; network dependencies must be modeled as
  inputs, future output references, or clearly marked non-sensitive mock outputs
  for static validation only.
- The RDS target must use PostgreSQL and remain compatible with the current
  FlagForge database contract, including schema expectations, connection
  configuration, and migration execution model.
- The application API, domain behavior, flag evaluation, audit-log behavior, and
  public OpenAPI contract must remain unchanged unless a separate OpenSpec
  change explicitly modifies them.
- Configuration documentation must explain local PostgreSQL versus AWS RDS
  differences, including connection source, credential source, TLS expectation,
  migration execution expectation, and environment-specific settings.
- The change must document how future deployment work can consume database
  references, such as endpoint, port, database name, username reference, password
  reference, and security group or network dependency outputs, without
  committing real values or secrets.
- The first credential pattern must use an RDS-managed master password or
  equivalent generated secret reference; no database password value may be
  committed, output in plaintext, or required through real `.tfvars` examples.
- The RDS target must not use publicly committed credentials, copied cloud
  tokens, account IDs, profile-specific values, production-only identifiers, or
  personal data in examples.
- The network model must be documented and must avoid implying public database
  exposure as the default.
- Secrets handling must be documented as references or future secret-management
  integration, not as committed `.env`, `.tfvars`, state, plan, log, or generated
  provider content.
- State, plan, logs, and outputs must be treated as sensitive artifacts because
  they may contain infrastructure metadata or LGPD-relevant configuration.
- Cost assumptions must be documented, including expected cost drivers, cleanup
  or rollback expectations, and whether the first target is intentionally
  development-sized rather than production-sized.
- Backup, deletion protection, encryption, parameter group, maintenance window,
  and monitoring expectations must be documented at the level needed for review,
  even when a setting is deferred or intentionally minimal for the learning
  target.
- Static validation must remain available without AWS credentials wherever the
  existing IaC foundation supports it.
- Account-backed plan, apply, destroy, import, or state-mutating workflows must
  remain separate from default verification and must require explicit human
  action and review.
- `npm run verify` must not require AWS credentials, remote state, a live RDS
  instance, or cloud provisioning.
- Documentation must identify the review gates for Staff, SRE, Security/LGPD,
  and QA before the change is considered ready for implementation.
- Follow-up AWS deployment features must be able to consume the database
  interface without redefining the database contract.

## Risks

- RDS networking or secret assumptions can leak into application code if the
  database contract is not kept environment-neutral.
- A database module can accidentally create networking scope if VPC, subnet, and
  security-group ownership is not explicitly excluded.
- A committed `dev` live composition can be mistaken for plan/apply readiness if
  mock network references are not clearly marked as static-validation-only.
- IaC outputs, state, plans, or logs can expose sensitive metadata if handling
  expectations are unclear.
- Cost can surprise contributors if instance class, storage, backups, retention,
  monitoring, and cleanup expectations are not documented before provisioning.
- A cloud database target can be mistaken for production readiness even though
  Level 3 AWS remains a learning target until deployment, operations, and
  security controls mature.
- Migration expectations can drift if local PostgreSQL and RDS use different
  execution paths without a documented compatibility check.
- Overbuilding high availability, replicas, or multi-region behavior in the
  first RDS increment can obscure the intended learning scope and raise cost.
- Under-specifying backup, encryption, deletion protection, and network access
  can create review gaps for SRE and Security/LGPD.

## Resolved decisions

- The AWS database target is RDS PostgreSQL, aligned with the accepted
  PostgreSQL persistence and Level 3 AWS decisions.
- The change follows OpenTofu/Terragrunt rather than manual cloud setup.
- The RDS work depends on the existing AWS IaC foundation and should not
  introduce unrelated EKS, ALB, production traffic, or application feature scope.
- The existing FlagForge PostgreSQL application contract remains the compatibility
  baseline.
- Static validation and account-backed provisioning remain separate workflow
  classes.
- `npm run verify` remains independent from AWS credentials and live cloud
  resources.
- Cost visibility and Security/LGPD review are part of the product requirements
  for this change.
- The first RDS increment must not create AWS networking resources; it consumes
  network references that future networking and remote-state changes will
  provide.
- The first credential contract uses an RDS-managed master password or equivalent
  generated secret reference rather than a committed or user-supplied password
  value.

## Open questions

- Should the first implementation include a real account-backed plan workflow, or
  should it stop at source-controlled IaC and documentation until a separate
  provisioning change?
- What minimum backup, deletion protection, and monitoring settings should be
  required for the first cost-conscious RDS target?

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/26
- OpenSpec change id requested by issue: `add-rds-postgres-aws`
- Relevant docs: `docs/adr/0005-use-postgresql-for-persistence.md`,
  `docs/adr/0007-use-level-3-aws-platform-as-future-production-target.md`,
  `docs/adr/0012-use-opentofu-and-terragrunt-for-iac.md`,
  `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`
- Foundation dependency:
  `openspec/changes/archive/2026-07-02-add-opentofu-terragrunt-aws-foundation/`
