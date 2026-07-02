## 1. IaC Structure

- [x] 1.1 Add an `infra/aws/` foundation directory that separates reusable OpenTofu modules from Terragrunt live environment composition.
- [x] 1.2 Add foundation-only OpenTofu/Terragrunt files for version constraints, provider assumptions, common inputs, tags, and environment layout without declaring managed AWS resources.
- [x] 1.3 Add examples or placeholders only where they support static validation and future composition.
- [x] 1.4 Ensure committed files do not contain AWS credentials, account secrets, production values, copied kubeconfigs, state files, or generated provider/module caches.
- [x] 1.5 Ensure examples, placeholder values, outputs, tags, and resource naming conventions avoid personal data, customer data, real account IDs, production-only identifiers, and other LGPD-relevant data.

## 2. Documentation and Guardrails

- [x] 2.1 Document the AWS IaC directory structure, module conventions, live environment naming, region assumptions, and expected future resource sequencing.
- [x] 2.2 Document state/backend assumptions as future work without requiring a real S3/DynamoDB backend for local validation.
- [x] 2.3 Document secrets and identity assumptions, including that local validation must not require AWS credentials.
- [x] 2.4 Document that local AWS profile names are optional placeholders for future account-backed workflows and that profile names, SSO URLs, account IDs, credentials, and personal workstation configuration must not be committed.
- [x] 2.5 Document Security/LGPD data-minimization rules for examples, variables, outputs, tags, resource names, documentation, and generated IaC artifacts.
- [x] 2.6 Document that OpenTofu/Terragrunt state files, plan files, command logs, generated provider files, and outputs are sensitive artifacts that can expose infrastructure metadata or LGPD-relevant configuration.
- [x] 2.7 Document future IAM/OIDC least-privilege requirements, including scoped trust relationships, short-lived credentials, environment-specific roles, no administrator defaults, no wildcard defaults, and no shared personal credentials.
- [x] 2.8 Document mandatory baseline tags for future AWS resources, including project, environment, managed-by, ownership, and cost-allocation metadata or documented equivalents, with non-sensitive values only.
- [x] 2.9 Document that this foundation has zero expected AWS cost and require future resource-producing changes to include expected monthly cost impact, cleanup or rollback steps, and explicit review.
- [x] 2.10 State prominently that this foundation does not create EKS, RDS, ECR, ALB, production deployment, Atlantis, Terrareg, or automatic apply workflows.
- [x] 2.11 Document future remote-state bootstrap requirements, including ownership, locking, encryption, versioning, access control, recovery, state migration, lock-failure handling, retention, and disposal expectations for generated IaC artifacts.
- [x] 2.12 Document rollback expectations for future AWS resource changes, distinguishing code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation where applicable.
- [x] 2.13 Document future AWS resource sequencing checkpoints for account or remote-state bootstrap, low-risk initial resources such as ECR, networking, RDS, EKS or ALB, and observability.
- [x] 2.14 Add or update an AWS IaC operations runbook covering prerequisites, credential-free validation, common local validation failures, commands that must not be run by default, no-resource verification, rollback or cleanup expectations, Security/LGPD escalation, and sensitive artifact handling.

## 3. Validation Workflow

- [x] 3.1 Add thin validation commands or Makefile targets for OpenTofu formatting/static validation and Terragrunt formatting/static validation where supported by foundation files.
- [x] 3.2 Ensure IaC validation commands do not run account-backed `plan`, `apply`, `destroy`, import, state mutation, `terragrunt run-all apply`, `terragrunt run-all destroy`, `--auto-approve`, or any command that provisions, destroys, imports, unlocks, taints, or mutates cloud resources or state.
- [x] 3.3 Ensure the documented local validation path can run without AWS credentials, without a live AWS account, without remote state, and without treating `plan` as validation.
- [x] 3.4 Keep `npm run verify` independent from OpenTofu, Terragrunt, AWS credentials, remote state, and cloud access unless a later OpenSpec change explicitly expands the gate.
- [x] 3.5 Document that future account-backed `plan` and future `apply` workflows require separate OpenSpec changes, explicit review, and Staff, SRE, and Security/LGPD review before introduction.

## 4. OpenSpec and Review

- [x] 4.1 Add or update the `aws-iac-foundation` spec delta for structure, validation, documentation, secrets, Security/LGPD data minimization, local AWS profiles, least privilege, mandatory tags, sensitive state/plan/log handling, cost, validate/plan/apply separation, dangerous-command guardrails, remote-state future work, rollback expectations, runbook coverage, and no-provisioning guardrails.
- [x] 4.2 Run `openspec validate add-opentofu-terragrunt-aws-foundation --strict`.
- [x] 4.3 Run repository verification or document why this planning-only change stopped before implementation.
- [x] 4.4 Prepare follow-up review notes for Staff, SRE, and Security/LGPD before any future resource-producing AWS change.
