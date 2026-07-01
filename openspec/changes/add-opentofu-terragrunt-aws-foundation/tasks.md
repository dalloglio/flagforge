## 1. IaC Structure

- [ ] 1.1 Add an `infra/aws/` foundation directory that separates reusable OpenTofu modules from Terragrunt live environment composition.
- [ ] 1.2 Add foundation-only OpenTofu/Terragrunt files for version constraints, provider assumptions, common inputs, tags, and environment layout without declaring managed AWS resources.
- [ ] 1.3 Add examples or placeholders only where they support static validation and future composition.
- [ ] 1.4 Ensure committed files do not contain AWS credentials, account secrets, production values, copied kubeconfigs, state files, or generated provider/module caches.

## 2. Documentation and Guardrails

- [ ] 2.1 Document the AWS IaC directory structure, module conventions, live environment naming, region assumptions, and expected future resource sequencing.
- [ ] 2.2 Document state/backend assumptions as future work without requiring a real S3/DynamoDB backend for local validation.
- [ ] 2.3 Document secrets and identity assumptions, including that local validation must not require AWS credentials.
- [ ] 2.4 Document that this foundation has zero expected AWS cost and require future resource-producing changes to include expected monthly cost impact, cleanup or rollback steps, and explicit review.
- [ ] 2.5 State prominently that this foundation does not create EKS, RDS, ECR, ALB, production deployment, Atlantis, Terrareg, or automatic apply workflows.
- [ ] 2.6 Document future remote-state bootstrap requirements, including ownership, locking, encryption, versioning, access control, recovery, state migration, and lock-failure handling.
- [ ] 2.7 Document rollback expectations for future AWS resource changes, distinguishing code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation where applicable.
- [ ] 2.8 Document future AWS resource sequencing checkpoints for account or remote-state bootstrap, low-risk initial resources such as ECR, networking, RDS, EKS or ALB, and observability.
- [ ] 2.9 Add or update an AWS IaC operations runbook covering prerequisites, credential-free validation, common local validation failures, commands that must not be run by default, no-resource verification, rollback or cleanup expectations, and escalation.

## 3. Validation Workflow

- [ ] 3.1 Add thin validation commands or Makefile targets for OpenTofu formatting/static validation and Terragrunt formatting/static validation where supported by foundation files.
- [ ] 3.2 Ensure IaC validation commands do not run account-backed `plan`, `apply`, `destroy`, import, state mutation, `terragrunt run-all apply`, `terragrunt run-all destroy`, `--auto-approve`, or any command that provisions, destroys, imports, unlocks, taints, or mutates cloud resources or state.
- [ ] 3.3 Ensure the documented local validation path can run without AWS credentials, without a live AWS account, without remote state, and without treating `plan` as validation.
- [ ] 3.4 Keep `npm run verify` independent from OpenTofu, Terragrunt, AWS credentials, remote state, and cloud access unless a later OpenSpec change explicitly expands the gate.
- [ ] 3.5 Document that future account-backed `plan` and future `apply` workflows require separate OpenSpec changes, explicit review, and Staff, SRE, and Security/LGPD review before introduction.

## 4. OpenSpec and Review

- [ ] 4.1 Add or update the `aws-iac-foundation` spec delta for structure, validation, documentation, secrets, cost, validate/plan/apply separation, dangerous-command guardrails, remote-state future work, rollback expectations, runbook coverage, and no-provisioning guardrails.
- [ ] 4.2 Run `openspec validate add-opentofu-terragrunt-aws-foundation --strict`.
- [ ] 4.3 Run repository verification or document why this planning-only change stopped before implementation.
- [ ] 4.4 Prepare follow-up review notes for Staff, SRE, and Security/LGPD before any future resource-producing AWS change.
