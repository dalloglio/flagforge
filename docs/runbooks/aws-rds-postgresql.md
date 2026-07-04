# AWS RDS PostgreSQL Runbook

## Service

AWS RDS PostgreSQL contract target for future FlagForge Level 3 AWS deployment work.

## Purpose

This runbook describes the safe operating expectations for the source-controlled RDS PostgreSQL contract. The committed `dev` composition is not account-backed plan/apply-ready until future networking, account, and remote-state changes provide real dependencies and reviewed workflows.

## Preconditions

- Work from the active OpenSpec change and review the RDS module under `infra/aws/modules/rds-postgresql/`.
- Do not use real AWS credentials, remote state, account IDs, SSO URLs, local profile names, `.tfvars`, state files, plan files, or command logs for default repository verification.
- Treat OpenTofu state, Terragrunt caches, generated provider files, plans, logs, outputs, and managed secret references as sensitive generated artifacts.
- Confirm any future account-backed workflow has Staff, SRE, Security/LGPD, and QA review before planning or provisioning.

## Static Validation

Run optional IaC checks separately from repository verification:

```bash
make iac-aws-fmt-check
make iac-aws-validate
```

These checks must not require AWS credentials, remote state, live RDS, account-backed plans, or cloud provisioning. Missing OpenTofu or Terragrunt is a local prerequisite issue. If the RDS module provider plugin is not installed, OpenTofu may download the public AWS provider during `init -backend=false`; that is still distinct from AWS account access.

`npm run verify` remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, live RDS, and cloud provisioning.

## Application Compatibility

The RDS target uses the same PostgreSQL compatibility baseline as local runtime persistence:

- versioned SQL migrations in `src/infrastructure/postgres/migrations/`;
- the existing migration runner through `npm run db:migrate`;
- the same application database configuration shape once future deployment work materializes the runtime secret;
- no AWS-specific schema or migration path.

No application API, domain, flag evaluation, audit-log, or OpenAPI behavior changes are part of this target.

## Network and Access

The default network model is private database access. Public database exposure is not the default and must not be introduced without a future reviewed change.

The module consumes:

- private subnet IDs;
- database security group IDs.

The module does not create VPCs, subnets, route tables, NAT gateways, internet gateways, or security groups. Mock values in the committed `dev` composition are static-validation placeholders only and are invalid for real plan/apply workflows.

## Credentials and Secrets

The first target uses an RDS-managed master password. The module accepts a non-secret username and exposes the managed master secret ARN as a sensitive output.

Future deployment work may consume the managed secret reference, create a separate application database user, or integrate with a dedicated secret-management workflow. It must not expose the password in committed `.tfvars`, examples, outputs, logs, state, plans, or application docs.

## Cost and Operations

The first target is development-sized and learning-focused. Cost drivers for any future apply include:

- instance class;
- allocated and autoscaled storage;
- backup and final snapshot retention;
- CloudWatch log ingestion and retention;
- data transfer;
- KMS key choice;
- Enhanced Monitoring;
- Performance Insights.

Current contract assumptions:

- encrypted storage is enabled;
- backup retention is seven days;
- final snapshot is enabled by default for future reviewed deletion workflows,
  using either the module-generated unique identifier or an explicit
  cleanup-time identifier;
- deletion protection is disabled for the non-production learning target;
- maintenance runs in a documented UTC window;
- PostgreSQL and upgrade logs are exported;
- custom parameter groups are deferred until workload evidence exists;
- Enhanced Monitoring and Performance Insights are disabled by default for cost control.

## Rollback and Cleanup

Code rollback only reverts repository files. It does not remove live RDS resources, recover state, or preserve database data if a future workflow provisions resources.

For future live resources, choose the correct path:

- Code rollback: revert module, Terragrunt, or documentation changes when no resources were applied.
- Planned resource cleanup: use a reviewed destroy or cleanup workflow only after data retention, final snapshot, and access impacts are approved.
- Final snapshot naming: before reviewed cleanup, confirm the configured final
  snapshot identifier is unique among retained snapshots in the target account;
  use the generated default or set `final_snapshot_identifier` explicitly for
  the cleanup workflow.
- State recovery: restore or repair OpenTofu/Terragrunt state through a reviewed state procedure, never through ad hoc state mutation.
- Data-preserving remediation: keep the database, snapshot it if needed, fix configuration or access separately, and avoid destructive cleanup.

## Validation Evidence

Before this change is considered ready:

- OpenSpec strict validation passes for `add-rds-postgres-aws`;
- repository verification passes without AWS credentials or live cloud resources;
- optional IaC validation is run locally when OpenTofu and Terragrunt are installed, or missing CLI prerequisites are documented;
- source inspection confirms default package scripts, Make targets, CI workflows, runbooks, and docs do not run account-backed plan, apply, destroy, import, state mutation, force-unlock, taint, or auto-approve workflows.

## Escalation

Request Staff review for RDS architecture, module/live boundaries, network dependency shape, and application contract compatibility.

Request SRE review for cost, operational settings, validation separation, rollback, cleanup, state recovery, and failure modes.

Request Security/LGPD review for private network access, credential references, managed secrets, generated artifacts, data minimization, tags, and outputs.

Request QA review for validation strategy and local-to-AWS PostgreSQL compatibility.
