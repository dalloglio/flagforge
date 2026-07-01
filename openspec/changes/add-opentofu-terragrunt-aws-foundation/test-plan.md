# Test Plan: add-opentofu-terragrunt-aws-foundation

## Scope

This plan covers validation for the AWS IaC foundation with OpenTofu and Terragrunt for Issue #25. The goal is to prove that the change creates a reviewable structure for future Level 3 AWS work without provisioning real resources, requiring AWS credentials, or changing the FlagForge API runtime.

The focus is to validate that:

- the structure lives under an infrastructure boundary, such as `infra/aws/`, outside `src/`;
- reusable OpenTofu modules are separated from Terragrunt live environment and region composition;
- foundation-only files do not declare managed AWS resources such as EKS, RDS, ECR, or ALB;
- OpenTofu format, Terragrunt format, and HCL are verifiable through explicit local commands;
- local validation does not require an AWS account, personal credentials, remote backend, state bucket, or cloud resources;
- no script, target, workflow, or document introduces `tofu apply`, `terragrunt apply`, or automatic apply behavior;
- documentation covers cost, credentials, profiles, state/backend, secrets, and scope limits;
- documentation separates credential-free validation from future account-backed plan and apply workflows;
- documentation covers dangerous IaC commands, remote-state bootstrap prerequisites, rollback expectations, future AWS resource sequencing, and operations runbook coverage;
- `npm run verify` remains independent from OpenTofu, Terragrunt, AWS, and cloud access;
- CI can run host-only gates and, if IaC CLIs are installed, static checks without provisioning.

Out of scope: creating AWS resources, AWS deployment, EKS, RDS, ECR, ALB, Route 53, Secrets Manager, real IAM/OIDC, real S3/DynamoDB backend, Atlantis, Terrareg, module registry, account-backed plan workflow, automatic apply, destroy workflow, state mutation workflow, and any public API contract change.

## Test levels

### Static repository structure checks

- Confirm that the IaC foundation is under `infra/aws/` or an equivalent documented infrastructure-oriented path.
- Confirm that AWS IaC files are not placed under `src/`, `test/`, local Helm chart paths, kind configuration, gateway configuration, or local observability configuration.
- Confirm that the tree separates OpenTofu modules from Terragrunt live composition, for example `modules/` and `live/<environment>/<region>/`.
- Confirm that environment names, regions, common tags, inputs, and outputs follow the documented convention.
- Confirm that placeholders or examples are identified as foundation-only and not production-ready.

### OpenTofu checks

- Run the documented OpenTofu formatting command, such as `tofu fmt -check -recursive`, scoped to the foundation.
- Run static OpenTofu validation where the structure allows it, preferring initialization without backend/cloud access, for example `tofu init -backend=false` before `tofu validate`.
- Confirm that provider and version constraints are declared in a reviewable way and do not activate a real remote backend.
- Confirm that no `.tf` file declares managed AWS resources in this change.
- Confirm that `.tfvars` files, local state, provider caches, and generated lock/cache artifacts are not treated as a source for secret configuration.

### Terragrunt checks

- Run the documented Terragrunt formatting command, such as `terragrunt hclfmt --check` or the equivalent supported by the adopted version.
- Run static Terragrunt validation if documented, as long as it does not initialize a remote backend or require AWS credentials.
- Confirm that `terragrunt.hcl` or equivalent files only compose foundation-only configuration.
- Confirm that any `remote_state`, `generate`, `dependency`, or include block documents future assumptions without depending on existing AWS resources.
- Confirm that there is no auto-apply configuration, apply hook, or command that executes provisioning.

### HCL and secrets checks

- Validate HCL parsing and formatting for `.tf`, `.tfvars.example`, `.hcl`, and Terragrunt files included in the change.
- Search for secret patterns: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AKIA` keys, tokens, kubeconfigs, real account IDs, passwords, state files, and production values.
- Confirm that examples use obvious placeholders, non-secret values, or names such as `example`, `dev`, and `local`, not personal data.
- Confirm that `.gitignore` or documentation covers relevant generated caches and artifacts, including `.terraform/`, `.terragrunt-cache/`, `*.tfstate`, and `*.tfstate.backup`.

### Documentation checks

- Review the AWS foundation documentation for directory structure, module conventions, live environments, regions, tags, and future sequencing.
- Confirm that cost is handled explicitly: this change should have zero AWS cost, and future changes that add resources must declare expected impact, rollback, or cleanup.
- Confirm that credentials and profiles are documented as future prerequisites, including AWS profiles, IAM/OIDC, and the absence of credential requirements for local validation.
- Confirm that remote state/backend is documented as future work or an explicit prerequisite, without requiring S3/DynamoDB now.
- Confirm that remote-state bootstrap is documented as a future resource-producing change that must define ownership, locking, encryption, versioning, access control, recovery, state migration, and lock-failure handling.
- Confirm that rollback expectations distinguish code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation where applicable.
- Confirm that future AWS resource sequencing checkpoints keep account or remote-state bootstrap, low-risk initial resources such as ECR, networking, RDS, EKS or ALB, and observability reviewable as separate changes.
- Confirm that an AWS IaC operations runbook or runbook section covers prerequisites, credential-free validation, common local validation failures, commands that must not be run by default, no-resource verification, rollback or cleanup expectations, and escalation.
- Confirm that the text clearly states that the foundation does not create resources, is not production-ready, and does not enable automatic apply.

### CI and workflow checks

- Confirm that `npm run verify` remains host-only and does not require OpenTofu, Terragrunt, AWS credentials, remote state, or cloud access.
- Confirm that any added or changed CI workflow does not configure AWS credentials or run apply/destroy.
- Confirm that required CI gates continue to cover `npm run typecheck`, `npm test`, OpenAPI if applicable, and `openspec validate --all --strict` through `npm run verify`.
- If CI runs optional IaC checks, confirm that they are format/static-only and fail on invalid format/HCL, not missing AWS account access.
- Confirm that added Makefile targets or npm scripts are thin wrappers over documented commands and do not hide apply behavior.
- Confirm that documented validation does not include account-backed `plan`, and that any future `plan` or `apply` workflow is explicitly deferred to a separate OpenSpec change.

## Cases

### Happy paths

- A contributor inspects the repository and finds the foundation in `infra/aws/`, separated from the TypeScript runtime.
- A contributor clearly identifies OpenTofu modules and Terragrunt live composition by environment and region.
- `tofu fmt -check -recursive` or the documented equivalent passes for OpenTofu files.
- `terragrunt hclfmt --check` or the documented equivalent passes for Terragrunt files.
- Documented static HCL validation passes on a workstation without AWS credentials.
- `npm run verify` passes in an environment without OpenTofu, Terragrunt, AWS profile, or cloud access.
- OpenSpec strict validation for the change passes.
- Documentation states that this foundation has zero AWS cost and requires cost review for future resource-producing changes.
- Documentation describes credentials/profiles as future prerequisites and explains that local validation does not require them.
- Documentation separates `validate`, future `plan`, and future `apply` workflows.
- Documentation includes an AWS IaC operations runbook or runbook section.

### Edge cases

- A workstation without AWS credentials can run the documented foundation-only validation path.
- A workstation without OpenTofu or Terragrunt receives a clear local prerequisite failure, not a false AWS error.
- Placeholder files are not confused with production-ready modules.
- Live environment/region paths exist only as foundation-only composition and do not point to real account IDs.
- Remote backend documentation does not configure a real bucket, lock table, or credentials.
- `npm run verify` behavior does not change when `AWS_PROFILE` is absent.
- CI on a clean runner does not depend on `.terraform/` or `.terragrunt-cache/`.
- Secrets review covers examples, docs, HCL, workflows, Makefile targets, and npm scripts.
- A future `plan` command is not presented as part of credential-free validation.
- Rollback guidance does not treat `destroy` as the only recovery path for persistent or shared resources.

### Expected failures

- Invalid OpenTofu formatting fails through `tofu fmt -check -recursive` or the documented equivalent.
- Invalid Terragrunt formatting fails through `terragrunt hclfmt --check` or the documented equivalent.
- Invalid HCL fails before any provisioning attempt.
- Presence of account-backed `tofu plan`, `terragrunt plan`, `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `terragrunt run-all apply`, `terragrunt run-all destroy`, `tofu import`, `tofu state rm`, `tofu force-unlock`, `tofu taint`, `--auto-approve`, or equivalent destructive or state-mutating behavior in a default script, CI target, verification target, or current procedure blocks the change.
- Presence of AWS credentials, tokens, kubeconfigs, state files, or production values blocks the change.
- Declaration of managed AWS resources blocks the change because it exceeds the foundation-only scope.
- `npm run verify` failing because an IaC CLI, AWS credential, or remote backend is absent blocks the change.
- Missing documentation for cost, credentials/profiles, validate/plan/apply separation, dangerous-command guardrails, runbook coverage, remote-state future work, rollback expectations, or no-apply behavior blocks release confidence.

## Data

### Files and paths

- Change: `openspec/changes/add-opentofu-terragrunt-aws-foundation/`.
- Expected IaC boundary: `infra/aws/` or equivalent documented infrastructure path.
- Expected module boundary: `infra/aws/modules/` or equivalent documented reusable-module path.
- Expected live boundary: `infra/aws/live/<environment>/<region>/` or equivalent documented composition path.
- Relevant docs: ADR 0007, ADR 0012, AWS IaC foundation documentation, delivery workflow context, and OpenSpec change artifacts.

### Allowed examples

- Non-secret placeholders such as `example`, `dev`, `local`, and `us-east-1` if documented as assumptions.
- Example AWS profile names only when clearly non-secret, such as `flagforge-dev`, and not required for static validation.
- Example tags and naming conventions that do not expose real accounts, secrets, or production identifiers.

### Disallowed data

- Real AWS access keys, session tokens, account secrets, copied kubeconfigs, or cloud tokens.
- Committed `.tfstate`, `.tfstate.backup`, `.terraform/`, `.terragrunt-cache/`, or generated provider/module caches.
- Real account IDs, production resource names, backend bucket names, lock table names, or personal profile names unless intentionally documented as placeholders.

## Automation

### Focused local commands

- `openspec validate add-opentofu-terragrunt-aws-foundation --strict`
- `openspec validate --all --strict`
- `npm run verify`
- Documented OpenTofu format command, expected to be equivalent to `tofu fmt -check -recursive` scoped to the AWS IaC tree.
- Documented OpenTofu static validation command, expected to avoid backend/cloud access.
- Documented Terragrunt format command, expected to be equivalent to `terragrunt hclfmt --check` or the supported local equivalent.
- Documented HCL/static validation command for Terragrunt, only if it can run without AWS credentials.
- Secret scan or deterministic text search for AWS credentials, state files, generated caches, account-backed plan, apply, destroy, state mutation, import, force-unlock, taint, run-all apply/destroy, and `--auto-approve` commands.

### Expected gates

- Required local completion gate: `npm run verify`.
- Required OpenSpec gate: `openspec validate add-opentofu-terragrunt-aws-foundation --strict`.
- Required no-provisioning review gate: inspect scripts, Makefile targets, workflows, and docs for absence of automatic apply/destroy.
- Required validate/plan/apply separation gate: inspect scripts, Makefile targets, workflows, runbooks, and docs for credential-free validation only, with account-backed plan/apply deferred to later OpenSpec changes.
- Required secrets review gate: inspect IaC, docs, examples, and workflows for absence of committed secrets and generated state/cache files.
- Required operations documentation gate: inspect AWS IaC documentation or runbook coverage for prerequisites, validation, common failures, no-resource verification, rollback or cleanup expectations, and escalation.
- Optional local IaC gate: run OpenTofu/Terragrunt format and static validation when CLIs are installed.

### CI criteria

- CI must not require AWS credentials, AWS account access, remote state, OpenTofu apply, Terragrunt apply, or cloud provisioning.
- CI must keep repository verification aligned with `npm run verify` and strict OpenSpec validation.
- If CI installs OpenTofu/Terragrunt for this change, it must run format/static-only checks and must not configure cloud credentials.
- CI failures should identify repository quality issues, malformed HCL, or formatting drift, not missing AWS access.
- Any future CI apply workflow must be introduced by a separate OpenSpec change with Staff, SRE, and Security/LGPD review.
- Any future CI plan workflow must be introduced by a separate OpenSpec change with backend, credential, state, cost, and review requirements documented.

## Residual risk

- Static validation does not prove future AWS account bootstrap, IAM/OIDC trust, remote state locking, drift detection, cost controls in AWS Billing, or real provider permissions.
- The foundation does not prove account-backed plan, apply, rollback, drift remediation, or remote-state recovery procedures.
- Without real resources, this plan cannot validate EKS, RDS, ECR, ALB, Route 53, Secrets Manager, network topology, backup, restore, or deployment behavior.
- Secret scanning by deterministic search can miss unknown secret formats; manual review remains required.
- Optional IaC CLI checks depend on developer or CI availability of OpenTofu and Terragrunt, while `npm run verify` intentionally remains independent of those tools.
- Foundation-only placeholders can drift if later resource-producing changes do not replace or validate them through their own OpenSpec changes.

## Blockers

None.

## Suggestions

- Add a documented `make iac-validate` or npm wrapper only if it remains a thin wrapper over format/static checks and never runs apply.
- Add a lightweight CI job for IaC format checks once OpenTofu/Terragrunt installation cost is acceptable for the repository.
- Add a deterministic secret-scan command for IaC paths, docs, and workflows before the first resource-producing AWS change.
- Add a separate remote-state bootstrap change before any shared state is required.
- Add a separate account-backed plan workflow change before CI or local docs include plan procedures.
- Require Staff, SRE, and Security/LGPD review before any future change introduces remote state, IAM/OIDC, real AWS resources, or apply-capable automation.

## Recommendation

Proceed with plan.
