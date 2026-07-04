## Why

FlagForge has PostgreSQL persistence locally and an OpenTofu/Terragrunt AWS
foundation, but the Level 3 AWS path still lacks a managed PostgreSQL target.
Defining RDS PostgreSQL now keeps later EKS, deployment, migration, and
operations changes from inventing database assumptions inside unrelated work.

## What Changes

- Add an AWS RDS PostgreSQL target through the selected OpenTofu/Terragrunt IaC
  workflow.
- Document environment configuration, migration expectations, cost assumptions,
  security/LGPD guardrails, and local-to-AWS database differences.
- Define database interface outputs or references that future AWS deployment
  changes can consume without committing secrets or real account-specific values.
- Keep RDS network inputs as dependencies on future networking outputs rather
  than creating VPC, subnet, or security-group resources in this change.
- Use an RDS-managed master password reference for the first target so no
  database password value is modeled as committed configuration.
- Preserve the existing FlagForge PostgreSQL application contract, including
  schema compatibility and migration expectations.
- Keep static IaC validation separate from future account-backed plan, apply,
  destroy, import, and state-mutating workflows.
- Exclude application feature behavior, public API behavior, EKS, ALB,
  production traffic, multi-region database design, and automatic cloud
  provisioning.

## Capabilities

### New Capabilities

- `aws-rds-postgresql`: Defines the AWS RDS PostgreSQL target, IaC placement,
  configuration contract, security and LGPD guardrails, cost documentation,
  operational expectations, validation boundaries, and handoff surface for
  future AWS deployment work.

### Modified Capabilities

- `aws-iac-foundation`: Clarifies that the foundation sequence has advanced
  from zero-resource scaffolding to an RDS contract increment, while account,
  remote-state, networking, plan, apply, and provisioning workflows remain out
  of scope.

## Impact

- Affected systems: `infra/aws/` OpenTofu/Terragrunt structure, AWS IaC
  documentation, runbooks, validation wrappers where appropriate, OpenSpec
  requirements, accepted AWS foundation scope documentation, and future AWS
  deployment sequencing.
- Affected existing capabilities: no public API, domain, flag evaluation,
  audit-log, local PostgreSQL persistence behavior, local kind, Helm, Kong,
  Argo CD, or observability behavior changes are expected.
- API impact: no public FlagForge API contract changes.
- Dependency impact: implementation may introduce IaC module inputs or
  documentation for RDS PostgreSQL, but default local verification must remain
  independent from AWS credentials, remote state, live RDS instances, and cloud
  provisioning.
