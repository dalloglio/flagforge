## Context

FlagForge already has PostgreSQL-backed runtime persistence, local PostgreSQL
development paths, and a source-controlled AWS IaC foundation under `infra/aws/`.
The accepted AWS target architecture includes RDS PostgreSQL, but the current
AWS foundation intentionally creates no managed resources.

This change is the first AWS database target. It should introduce RDS
PostgreSQL as reviewable infrastructure while preserving the existing
application database contract and keeping default repository verification free
from AWS credentials, remote state, live resources, and provisioning behavior.

Stakeholders are Staff, SRE, Security/LGPD, QA, and future AWS deployment
changes that will need database references without redefining persistence.

## Goals / Non-Goals

**Goals:**

- Add a source-controlled RDS PostgreSQL target in the existing OpenTofu and
  Terragrunt AWS structure.
- Keep reusable module code separate from environment composition.
- Represent the first target as a non-production `dev` learning environment.
- Keep RDS dependent on externally supplied network references and avoid
  creating VPCs, subnets, route tables, NAT gateways, or security groups.
- Make the committed `dev` composition a static contract target, not an
  account-backed plan or apply target until future networking, account, and
  remote-state changes provide real dependencies.
- Preserve compatibility with the existing FlagForge PostgreSQL schema,
  connection, and migration model.
- Document local-to-AWS configuration differences, secret handling, network
  assumptions, cost drivers, rollback or cleanup, and operational expectations.
- Define non-secret database outputs or references that future deployment work
  can consume.
- Keep static validation, account-backed plan, and apply or destroy workflows
  separate.

**Non-Goals:**

- EKS, ALB, production traffic, or workload deployment.
- Public API, domain, flag evaluation, audit-log, or application feature
  changes.
- Multi-region design, read replicas, or production high availability.
- VPC, subnet, route table, NAT gateway, security-group, EKS, ALB, IAM/OIDC, or
  remote-state bootstrap resources.
- Automatic CI provisioning or default account-backed IaC commands.
- Remote state bootstrap, IAM/OIDC automation, or secret-management
  implementation beyond documented references.

## Decisions

### Add an `aws-rds-postgresql` capability instead of modifying existing persistence specs

The local `postgresql-persistence` capability already defines the application
runtime contract and migration behavior. This change adds an AWS infrastructure
target that must remain compatible with that contract, but it does not alter API
or persistence semantics.

Alternative considered: modify `postgresql-persistence`. That would imply the
application persistence behavior is changing. The better boundary is a new AWS
platform capability that references the existing contract.

### Implement RDS as an AWS IaC module plus live `dev` composition

Reusable RDS definitions should live under `infra/aws/modules/`, while
Terragrunt live wiring should live under the existing `infra/aws/live/dev/`
environment path. The first environment is `dev` because the foundation already
uses that convention and the issue describes a future Level 3 learning target,
not production.

Alternative considered: add only documentation. That would not satisfy the
requirement that the AWS PostgreSQL target be represented through the selected
IaC workflow. Another alternative is to add production-like multi-environment
composition immediately, but that raises cost and review complexity before AWS
deployment work exists.

### Treat networking as an explicit dependency, not part of the RDS module

The RDS module should require network references as inputs, such as private
subnet IDs or a future database subnet-group reference and database security
group IDs. It may define RDS-specific attachment objects only when they are
derived from those inputs, but it must not create VPCs, subnets, route tables,
internet gateways, NAT gateways, or security groups.

The `dev` Terragrunt composition should document and wire the shape of those
dependencies without becoming an account-backed target. If placeholder or mock
dependency outputs are needed for static validation, they must be clearly named
as non-sensitive examples and documented as invalid for real plan or apply.
Future AWS networking and remote-state changes are responsible for providing
real network outputs.

Alternative considered: include a minimal VPC and security group with RDS. That
would make the first database increment appear more complete, but it would also
collapse networking, cost, security, and database review into one change and
contradict the current sequencing guardrails.

### Keep application configuration environment-neutral

The RDS target should expose or document non-secret references such as endpoint,
port, database name, username reference, password reference, subnet/security
group dependency, and connection mode. The application should continue to use
its existing PostgreSQL configuration path, with future deployment work
responsible for materializing the final `DATABASE_URL` or equivalent secret.

Alternative considered: change application configuration now for AWS-specific
inputs. That would couple runtime code to a platform target before workload
deployment exists.

### Use RDS-managed master password references for the first target

The first RDS target should use the AWS RDS managed master password capability
where supported, so the module models a username and a generated secret
reference without accepting or committing a database password value. The module
handoff may expose the managed secret ARN or equivalent reference as a sensitive
output for future deployment work, but it must not output the password itself.

Future workload deployment remains responsible for deciding whether the
application uses that managed master secret directly, derives an application
database user, or integrates with a separate secret-management workflow. This
change only establishes the safe credential reference contract.

Alternative considered: require a sensitive password input. That is compatible
with OpenTofu, but it would invite `.tfvars`, local shell history, state, and
plan-handling problems before this project has account, remote-state, and secret
management workflows.

### Treat credentials and generated IaC artifacts as sensitive

Examples must avoid real account IDs, personal profile names, SSO URLs,
passwords, `.tfvars` with real values, committed state, generated provider
files, plan files, and command logs. Secret values should be modeled as
references or future secret-management integration points rather than committed
inputs.

Alternative considered: commit development credentials like the local Docker
Compose PostgreSQL defaults. That is acceptable only for local non-secret
development services, not for AWS resources.

### Separate static validation from account-backed operations

Formatting and static validation may be documented or wrapped without AWS
credentials. Account-backed `plan`, `apply`, `destroy`, import, and
state-mutating commands must remain explicit, reviewed workflows and must not
enter `npm run verify`, default Make targets, or CI.

Alternative considered: add a plan or apply target now. That creates credential,
remote-state, cost, and cleanup requirements that deserve separate review before
automation is introduced.

### Document cost-conscious defaults without claiming production readiness

The first RDS target should be development-sized and documented as a learning
environment. Cost documentation should identify instance class, storage, backup
retention, monitoring, encryption, maintenance, deletion protection, and cleanup
or rollback assumptions.

Alternative considered: design a production-grade highly available RDS topology
now. That would be premature without EKS, network, traffic, alerting, backup
restore, and operational ownership changes.

## Risks / Trade-offs

- RDS module design may get ahead of networking foundations -> Keep network
  dependencies explicit as inputs or references, avoid inventing VPC or security
  group scope, and mark live `dev` wiring as non-provisionable until future
  networking outputs exist.
- Outputs can leak sensitive infrastructure metadata -> Mark sensitive outputs
  appropriately, especially the managed master secret reference, and document
  that state, plans, logs, and outputs are sensitive generated artifacts.
- Cost can become non-obvious -> Require expected cost drivers and cleanup or
  rollback documentation before implementation is considered complete.
- Static validation may not prove cloud compatibility -> Treat static validation
  as syntax and structure validation only; require future account-backed review
  before real provisioning.
- RDS can be mistaken for production readiness -> Use `dev` learning-language in
  docs and explicitly exclude production traffic and production high
  availability.
- Migration execution can drift between local PostgreSQL and RDS -> Document
  that the same versioned migration path remains the compatibility baseline.

## Migration Plan

1. Add the RDS PostgreSQL OpenTofu module and Terragrunt live composition for
   the first static-contract `dev` target.
2. Document configuration, secret references, network assumptions, cost
   assumptions, validation commands, and cleanup or rollback expectations.
3. Run OpenSpec validation and repository verification that do not require AWS
   credentials or live cloud resources.
4. Optionally run IaC formatting or static validation when local OpenTofu and
   Terragrunt CLIs are installed, still without default provisioning.
5. Defer account-backed plan, apply, remote state, real networking dependencies,
   and deployment consumption to explicit reviewed workflows or follow-up
   changes.

Rollback for repository changes is code rollback. If a future human-reviewed
apply creates RDS resources, cleanup must follow the documented resource cleanup
or data-preserving remediation path rather than relying on code rollback alone.

## Open Questions

- Should a later change introduce account-backed plan validation before any
  apply-capable workflow?
- What exact minimum backup retention, deletion protection, and monitoring
  settings should be required once this learning target becomes more
  production-like?
