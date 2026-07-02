# AWS IaC Foundation

This directory is the source-controlled OpenTofu and Terragrunt foundation for future FlagForge Level 3 AWS work. It is preparation only: it does not create EKS, RDS, ECR, ALB, production deployment, Atlantis, Terrareg, automatic apply workflows, or any other AWS resource.

## Directory Structure

- `modules/`: reusable OpenTofu modules. Modules define resource patterns only when a future OpenSpec change introduces resources.
- `modules/foundation/`: foundation-only validation module with version constraints, common variables, tag conventions, and non-sensitive outputs.
- `live/<environment>/<region>/`: Terragrunt live composition for future account-backed environments.
- `live/dev/us-east-1/`: placeholder live composition used to prove layout and formatting conventions. The region is an example convention, not a committed account or production choice.
- `common.hcl`: shared non-secret local values for Terragrunt composition.

Future environment names should be short, non-sensitive, and reviewable, for example `dev`, `stage`, or `prod`. Future region choices must be documented in the OpenSpec change that introduces account-backed resources.

## Module Conventions

Modules should keep provider requirements, variables, outputs, and resource definitions close to the module. Live Terragrunt configuration decides which environment and region uses a module. This foundation module intentionally contains no managed AWS resources.

Future modules must:

- use explicit OpenTofu version constraints;
- keep inputs non-secret by default;
- define outputs only when they are needed and non-sensitive;
- apply mandatory tags where the AWS resource supports tags;
- avoid personal data, customer data, real account IDs, secrets, production-only identifiers, workstation-specific paths, and other LGPD-relevant data in examples, tags, names, variables, outputs, and documentation.

## Mandatory Tags

Future AWS resources must include these baseline tags or a documented equivalent:

- `project`: `flagforge`
- `environment`: the live environment name, such as `dev`
- `managed-by`: `opentofu`
- `owner`: a non-personal team or project ownership value, such as `platform`
- `cost-center`: a non-sensitive allocation value, such as `learning`

Tag values must not contain personal names, email addresses, customer data, secrets, real AWS account IDs, SSO URLs, production-only identifiers, or other sensitive values. Future resource-producing changes must show how mandatory tags are applied or explain why a resource cannot support them.

## State and Backend Assumptions

This foundation uses local validation only. It does not configure S3 remote state, DynamoDB locking, backend credentials, or account-specific state paths.

Remote state bootstrap is future resource-producing work. Before remote state is used, a separate OpenSpec change must define ownership, locking, encryption, versioning, access control, recovery, state migration, lock-failure handling, retention, and disposal expectations for generated IaC artifacts.

OpenTofu and Terragrunt state files, plan files, command logs, generated provider files, generated module caches, and outputs can expose infrastructure metadata or LGPD-relevant configuration. Keep them out of source control unless a future reviewed change explicitly permits a safe example artifact.

## Secrets and Identity

Credential-free validation must not require AWS credentials, a live AWS account, remote state, committed backend credentials, local AWS profiles, or production kubeconfigs.

Do not commit secrets, personal AWS credentials, copied cloud tokens, SSO start URLs, real account IDs, profile names from a personal workstation, `.env` values, `.tfvars` files with real values, backend configuration with real values, generated Terragrunt provider files, or kubeconfigs.

Local AWS profile names are optional placeholders for future account-backed workflows. They are not required for this foundation and must not appear in committed examples or generated files.

Future IAM/OIDC work must use least-privilege policies, scoped trust relationships, short-lived credentials, environment-specific roles, and explicit audience or subject constraints where applicable. Administrator policies, wildcard defaults, broad principals, long-lived access keys, and shared personal credentials must not be used as defaults. IAM/OIDC, CI plan, and apply-capable workflows require Security/LGPD review before introduction.

## Validation

Local validation is static and credential-free:

```bash
make iac-aws-fmt-check
make iac-aws-validate
```

The targets are thin wrappers around local CLI checks:

- `tofu fmt -check -recursive infra/aws/modules`
- `tofu -chdir=infra/aws/modules/foundation init -backend=false`
- `tofu -chdir=infra/aws/modules/foundation validate`
- `terragrunt hcl format --check --working-dir infra/aws`

Missing `tofu` or `terragrunt` should fail as a local prerequisite issue, not as missing cloud access. These targets must not run account-backed `plan`, `apply`, `destroy`, import, state mutation, unlock, taint, `terragrunt run-all apply`, `terragrunt run-all destroy`, or `--auto-approve`.

`npm run verify` intentionally remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, and cloud access. IaC validation is separate until a future OpenSpec change expands the gate.

## Plan, Apply, and Cost Guardrails

This foundation has zero expected AWS cost because it creates no cloud resources.

Account-backed `plan` workflows are future work because they require AWS credentials, provider initialization, backend selection, remote state, and cost review. Apply workflows are separate future work and require explicit human review.

Future resource-producing AWS changes must include:

- expected monthly cost impact;
- cleanup or rollback steps;
- no-resource or resource-change verification;
- Staff, SRE, and Security/LGPD review before remote state, IAM/OIDC, real AWS resources, account-backed plans, or apply-capable automation are introduced.

Dangerous or state-mutating commands are out of scope for this foundation, including `tofu plan`, `terragrunt plan`, `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `terragrunt run-all apply`, `terragrunt run-all destroy`, `tofu import`, `tofu state rm`, `tofu force-unlock`, `tofu taint`, and any default command using `--auto-approve`.

## Future Sequencing

Future AWS work should stay reviewable as separate changes:

1. Account or remote-state bootstrap.
2. Low-risk initial resources such as ECR.
3. Networking baseline.
4. RDS PostgreSQL.
5. EKS or ALB.
6. Observability and operational integration.

Each resource-producing change must distinguish code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation where applicable.
