# AWS IaC Foundation Runbook

## Service

AWS IaC foundation for future FlagForge Level 3 OpenTofu and Terragrunt work.

## Purpose

This runbook describes how to validate the foundation safely, diagnose local static-check failures, verify that no AWS resources are created, and prepare future resource-producing changes for review.

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

### No-Resource Verification

For this foundation, no-resource verification is source inspection:

- confirm `infra/aws/modules/foundation/` contains no `resource` blocks;
- confirm `package.json`, `Makefile`, and CI workflows do not invoke account-backed or state-mutating IaC commands;
- confirm no state files, plan files, generated provider files, `.terraform/`, `.terragrunt-cache/`, `.tfvars`, credentials, account IDs, SSO URLs, or production values are committed.

## Alerts

There are no runtime alerts for this foundation because it creates no AWS resources and has zero expected AWS cost.

Escalate immediately if a review finds committed credentials, personal data, customer data, real account IDs, production-only identifiers, generated state, plan artifacts, provider caches, or command logs with sensitive infrastructure metadata.

## Validation

Successful validation means:

- OpenSpec strict validation passes for the change;
- repository verification remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, and cloud access;
- IaC static validation passes locally when the optional CLIs are installed, or the missing local CLI prerequisite is documented;
- source inspection confirms no AWS resources are declared or provisioned.

## Rollback and Cleanup

Rollback for this foundation is code rollback only because no cloud resources exist.

Future AWS resource-producing changes must document rollback before implementation is considered complete. The rollback plan must distinguish code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation where applicable.

## Escalation

Request Staff review for architecture boundaries, module/live composition, remote-state bootstrap, IAM/OIDC shape, and sequencing.

Request SRE review for operability, validation commands, rollback, cleanup, state handling, and failure modes.

Request Security/LGPD review for credentials, local profiles, OIDC trust, least privilege, sensitive generated artifacts, data minimization, tags, outputs, and examples.
