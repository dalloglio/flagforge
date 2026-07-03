# AWS IaC Foundation

This directory is the source-controlled OpenTofu and Terragrunt foundation for future FlagForge Level 3 AWS work. It now includes a static RDS PostgreSQL contract target for the first non-production `dev` database. It does not create EKS, ECR, ALB, production deployment, Atlantis, Terrareg, automatic apply workflows, account-backed plan/apply targets, or AWS networking resources.

The committed RDS composition is source-controlled for review and local static checks only. It is not plan/apply-ready until future account, networking, and remote-state changes provide real dependencies and reviewed workflows.

## Directory Structure

- `modules/`: reusable OpenTofu modules. Modules define resource patterns only when a future OpenSpec change introduces resources.
- `modules/foundation/`: foundation-only validation module with version constraints, common variables, tag conventions, and non-sensitive outputs.
- `modules/rds-postgresql/`: reusable RDS PostgreSQL module for the FlagForge database contract. It creates an RDS subnet group and DB instance from supplied network references and does not create VPC, subnet, route table, NAT gateway, internet gateway, or security-group resources.
- `live/<environment>/<region>/`: Terragrunt live composition for future account-backed environments.
- `live/dev/us-east-1/`: placeholder live composition used to prove layout and formatting conventions. The region is an example convention, not a committed account or production choice.
- `live/dev/us-east-1/rds-postgresql/`: static non-production RDS contract composition. Mock network values in this directory are non-sensitive shape placeholders only and are invalid for real account-backed plan or apply.
- `common.hcl`: shared non-secret local values for Terragrunt composition.

Future environment names should be short, non-sensitive, and reviewable, for example `dev`, `stage`, or `prod`. Future region choices must be documented in the OpenSpec change that introduces account-backed resources.

## Module Conventions

Modules should keep provider requirements, variables, outputs, and resource definitions close to the module. Live Terragrunt configuration decides which environment and region uses a module. The foundation module intentionally contains no managed AWS resources. The RDS PostgreSQL module is the first resource contract module, but its committed live composition still stops short of real account-backed provisioning.

Future modules must:

- use explicit OpenTofu version constraints;
- keep inputs non-secret by default;
- define outputs only when they are needed and non-secret or explicitly marked sensitive;
- apply mandatory tags where the AWS resource supports tags;
- avoid personal data, customer data, real account IDs, secrets, production-only identifiers, workstation-specific paths, and other LGPD-relevant data in examples, tags, names, variables, outputs, and documentation.

## RDS PostgreSQL Contract

The RDS module defines PostgreSQL as the AWS managed database target for the existing FlagForge persistence contract. It uses:

- PostgreSQL engine version `17` by default;
- development-sized `db.t4g.micro` capacity in the `dev` composition;
- encrypted `gp3` storage;
- seven-day backup retention;
- UTC backup and maintenance windows;
- CloudWatch export settings for PostgreSQL and upgrade logs;
- no public accessibility by default;
- no high availability, read replica, multi-region, or production traffic claim.

The module requires existing private subnet IDs and database security group IDs as inputs. Those dependencies are owned by future networking and remote-state changes. The module may create an RDS DB subnet group from supplied subnet IDs, but it does not create or modify the underlying VPC, subnets, route tables, NAT gateway, internet gateway, or security groups.

The first target uses an RDS-managed master password through `manage_master_user_password = true`. The module accepts a non-secret username and exposes the managed secret ARN as a sensitive output. It does not accept a database password variable, `.tfvars` password, plaintext output, or committed example password.

Future deployment work may consume these handoff references without redefining the database contract:

- endpoint and hostname;
- port;
- database name;
- non-secret username reference;
- sensitive managed master secret ARN;
- private subnet and database security group references.

OpenTofu state, Terragrunt caches, generated provider files, plan files, command logs, and outputs from any future account-backed workflow can expose infrastructure metadata or secrets. Treat them as sensitive generated artifacts.

## Local PostgreSQL and AWS RDS Differences

The application database contract remains the existing PostgreSQL contract. No application API, domain, flag evaluation, audit-log, or OpenAPI behavior changes are introduced by this target.

| Concern              | Local PostgreSQL                                                       | AWS RDS PostgreSQL                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Connection source    | Local Docker Compose or test service URLs.                             | Future deployment materializes endpoint, port, database name, username, and secret reference from IaC outputs or secret management. |
| Credential source    | Local non-secret development defaults in environment files or Compose. | RDS-managed master password reference or future application-user secret workflow. No committed password value.                      |
| TLS expectation      | Local development may connect without TLS.                             | Future AWS runtime should require TLS-capable PostgreSQL clients and deployment-specific TLS configuration.                         |
| Migration execution  | `npm run db:migrate` applies versioned SQL migrations.                 | Same migration path remains the compatibility baseline; future deployment work decides where and how to run it against RDS.         |
| Network reachability | Local host, Compose network, or kind-local paths.                      | Private AWS network path only; public database exposure is not the default.                                                         |
| Environment settings | Local `DATABASE_URL` and `TEST_DATABASE_URL`.                          | Future workload deployment assembles equivalent runtime configuration from non-secret outputs and sensitive secret references.      |

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
- `tofu -chdir=infra/aws/modules/rds-postgresql init -backend=false`
- `tofu -chdir=infra/aws/modules/rds-postgresql validate`
- `terragrunt hcl format --check --working-dir infra/aws`

Missing `tofu` or `terragrunt` should fail as a local prerequisite issue, not as missing cloud access. The RDS module validation may download the public AWS provider plugin when it is not already installed, but it must not require AWS credentials or remote state. These targets must not run account-backed `plan`, `apply`, `destroy`, import, state mutation, unlock, taint, `terragrunt run-all apply`, `terragrunt run-all destroy`, or `--auto-approve`.

`npm run verify` intentionally remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, and cloud access. IaC validation is separate until a future OpenSpec change expands the gate.

## Plan, Apply, and Cost Guardrails

The committed repository has zero expected AWS cost because default verification does not provision cloud resources. A future reviewed account-backed apply of the RDS contract would introduce cost.

Account-backed `plan` workflows are future work because they require AWS credentials, provider initialization, backend selection, remote state, and cost review. Apply workflows are separate future work and require explicit human review.

RDS cost drivers for a future `dev` apply include instance class, allocated and autoscaled storage, backup retention, snapshot retention, CloudWatch log ingestion and retention, data transfer, KMS key choice, Enhanced Monitoring, and Performance Insights. The first target is intentionally development-sized and learning-focused, not production-ready.

RDS operational defaults in this contract:

- storage encryption enabled, using the AWS-managed key unless a future change supplies a KMS key;
- seven-day backup retention;
- final snapshot enabled by default when a resource is deleted through a future reviewed workflow;
- deletion protection disabled for the non-production learning target, with future production-like changes expected to revisit it;
- auto minor version upgrades enabled during the maintenance window;
- no custom parameter group yet; PostgreSQL parameter tuning is deferred until workload evidence exists;
- Enhanced Monitoring and Performance Insights disabled by default for cost control and documented as future tuning points.

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
4. RDS plan/apply readiness using real network dependencies.
5. EKS or ALB.
6. Observability and operational integration.

Each resource-producing change must distinguish code rollback, planned destroy or cleanup, state recovery, and data-preserving remediation where applicable.
