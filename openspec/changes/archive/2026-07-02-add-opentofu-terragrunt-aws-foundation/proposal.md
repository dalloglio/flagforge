## Why

FlagForge is starting its Level 3 AWS preparation path. The accepted target architecture uses AWS for future production-style delivery, and ADR 0012 selects OpenTofu with Terragrunt for repeatable infrastructure composition.

The repository needs an IaC foundation before any real AWS resources are introduced. Without a source-controlled structure, validation convention, and guardrails, later AWS changes could mix environment layout, module design, credentials assumptions, state handling, and provisioning behavior into the first resource change.

## What Changes

- Add the initial OpenTofu and Terragrunt repository structure for future AWS work.
- Document environment layout, module conventions, state/backend assumptions, cost guardrails, secrets handling, and validation commands.
- Document Security/LGPD guardrails for sensitive data minimization, state/plan/log handling, mandatory tags, least-privilege IAM/OIDC assumptions, and local AWS profile usage.
- Add static validation entrypoints that do not require AWS credentials and do not provision cloud resources.
- Keep validation, future planning, and future apply workflows operationally separate so local static checks cannot be confused with account-backed infrastructure changes.
- Document dangerous-command guardrails, future remote-state prerequisites, rollback expectations, and an operations runbook for the AWS IaC foundation.
- Add placeholder or foundation-only module/environment files only where they support validation and future composition.
- Keep EKS, RDS, ECR, ALB, production deployment, Atlantis, Terrareg, and automatic apply workflows out of scope.

## Capabilities

### New Capabilities

- `aws-iac-foundation`: Requirements for the source-controlled OpenTofu/Terragrunt AWS foundation, static validation workflow, documentation, and guardrails for future Level 3 infrastructure work.

### Modified Capabilities

- None.

## Impact

- Affected systems: repository infrastructure layout, Makefile or npm validation wrappers, local development runbook or IaC documentation, OpenSpec requirements, Security/LGPD review criteria, and future AWS platform sequencing.
- Affected existing capabilities: no public API, domain, persistence, local kind, Helm, Kong, Argo CD, or observability behavior changes are expected.
- API impact: no public FlagForge API contract changes.
- Dependency impact: optional local validation may require OpenTofu and Terragrunt CLIs, but `npm run verify` must remain independent from AWS credentials, a live AWS account, and cloud provisioning.
