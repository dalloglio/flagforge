# AWS IaC Foundation Runbook

## Service

Completed FlagForge v1 Level 3 OpenTofu and Terragrunt foundation/contract
scope, including static RDS PostgreSQL, EKS, and ALB targets. Current lifecycle
and evidence classifications live in `docs/project-status.md`; account-backed
AWS execution remains future work.

## Purpose

This runbook describes how to validate the foundation safely, diagnose local static-check failures, verify that default workflows do not provision AWS resources, and prepare future resource-producing changes for review.

## Preconditions

- Work from a clean branch for the active OpenSpec change.
- Install OpenTofu and Terragrunt only when running IaC-specific validation.
- Do not configure AWS credentials for foundation validation.
- Do not use a live AWS account, remote state bucket, DynamoDB lock table, production kubeconfig, or copied cloud token.
- Treat state files, plan files, command logs, generated provider files, module caches, and outputs as sensitive artifacts.

## Procedures

### Credential-Free Validation

Run:

```bash
make iac-aws-fmt-check
make iac-aws-validate
```

These commands are expected to use local files only. Missing `tofu` or `terragrunt` means the workstation is missing a local prerequisite. It is not a reason to add AWS credentials.

The RDS PostgreSQL module validation may initialize the public AWS provider plugin with `-backend=false`. That is still static validation and must not be expanded into account-backed plan or apply behavior.

### Common Local Failures

- `tofu: command not found`: install OpenTofu or skip IaC validation with a documented reason.
- `terragrunt: command not found`: install Terragrunt or skip Terragrunt formatting with a documented reason.
- Formatting failure: run the corresponding local formatter and review the diff before committing.
- HCL validation failure: inspect the file and fix local syntax or variable-shape issues.
- Backend, provider, credential, or account errors: stop and verify the command did not drift into account-backed `plan`, `apply`, backend initialization, or provider access.

### Commands That Must Not Run By Default

Do not run these as part of this foundation:

- `tofu plan`
- `terragrunt plan`
- `tofu apply`
- `terragrunt apply`
- `tofu destroy`
- `terragrunt destroy`
- `terragrunt run-all apply`
- `terragrunt run-all destroy`
- `tofu import`
- `tofu state rm`
- `tofu force-unlock`
- `tofu taint`
- any default command with `--auto-approve`

Future account-backed `plan` and `apply` workflows require separate OpenSpec changes, explicit review, and Staff, SRE, and Security/LGPD review.

### Default No-Provisioning Verification

For this foundation, default no-provisioning verification is source inspection:

- confirm `infra/aws/modules/foundation/` contains no `resource` blocks;
- confirm `infra/aws/modules/rds-postgresql/` only defines the RDS contract and does not create VPC, subnet, route table, NAT gateway, internet gateway, or security-group resources;
- confirm the EKS and ALB modules contain only their reviewed static contract
  resources and consume network/IAM references rather than creating those
  external dependencies;
- confirm `infra/aws/live/dev/us-east-1/rds-postgresql/` uses only static-validation mock network values and documents them as invalid for real plan or apply;
- confirm `package.json`, `Makefile`, and CI workflows do not invoke account-backed or state-mutating IaC commands;
- confirm no state files, plan files, generated provider files, `.terraform/`, `.terragrunt-cache/`, `.tfvars`, credentials, account IDs, SSO URLs, or production values are committed.

## Alerts

There are no runtime alerts for default repository workflows because they do not provision AWS resources and have zero expected AWS cost.

Escalate immediately if a review finds committed credentials, personal data, customer data, real account IDs, production-only identifiers, generated state, plan artifacts, provider caches, or command logs with sensitive infrastructure metadata.

## Validation

Successful validation means:

- OpenSpec strict validation passes for the change;
- repository verification remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, and cloud access;
- IaC static validation passes locally when the optional CLIs are installed, or the missing local CLI prerequisite is documented;
- source inspection confirms only the reviewed static RDS, EKS, and ALB
  resource contracts are declared and no AWS resource is provisioned by
  validation.

## Rollback and Cleanup

Rollback for unprovisioned foundation changes is code rollback only.

If a future reviewed workflow provisions RDS resources, code rollback alone does not remove the database, recover state, or preserve data. Use the dedicated RDS runbook at `docs/runbooks/aws-rds-postgresql.md` to distinguish code rollback, planned resource cleanup, state recovery, and data-preserving remediation.

## Escalation

Request Staff review for architecture boundaries, module/live composition, remote-state bootstrap, IAM/OIDC shape, and sequencing.

Request SRE review for operability, validation commands, rollback, cleanup, state handling, and failure modes.

Request Security/LGPD review for credentials, local profiles, OIDC trust, least privilege, sensitive generated artifacts, data minimization, tags, outputs, and examples.
