## Context

FlagForge already has local Docker, PostgreSQL, Helm, kind, Argo CD, Kong, and Prometheus/Grafana practice paths. ADR 0007 accepts AWS as the future Level 3 target architecture with EKS, RDS PostgreSQL, ECR, ALB, IAM/OIDC, Argo CD, Helm, Kong, and observability tooling. ADR 0012 accepts OpenTofu as the IaC runtime and Terragrunt for composition and environment management.

This change starts Level 3 by adding the IaC foundation only. It should make later AWS resource changes easier to review without creating any real AWS infrastructure now.

## Goals / Non-Goals

**Goals:**

- Establish a source-controlled OpenTofu/Terragrunt layout for future AWS work.
- Define conventions for modules, live environments, provider configuration, backend/state assumptions, variable naming, tags, and outputs.
- Provide validation commands for formatting and static checks that can run locally without AWS credentials.
- Document cost, secrets, environment, and provisioning guardrails.
- Keep validation explicit and separate from automatic cloud apply behavior.

**Non-Goals:**

- Creating EKS, RDS, ECR, ALB, IAM/OIDC production roles, Route 53, Secrets Manager, monitoring stacks, or any other real AWS resource.
- Adding automatic `apply`, GitHub Actions apply, Atlantis, Terrareg, or remote module registry workflows.
- Deploying FlagForge to AWS.
- Changing runtime application code, public API behavior, database schema, Helm chart behavior, local kind behavior, or production secret handling.

## Decisions

### Use an `infra/aws` foundation boundary

The AWS IaC foundation will live under an infrastructure-oriented path such as `infra/aws/`, separate from application source, local kind configuration, gateway configuration, and observability configuration.

Rationale: the repository already keeps platform assets under `infra/`, and AWS IaC is a platform concern. Keeping the boundary explicit prevents TypeScript runtime code from depending on cloud infrastructure details.

Alternative considered: place AWS files at the repository root. That would reduce path depth but make the repository root a mix of application, local platform, and cloud platform concerns.

### Separate reusable modules from live environment composition

The structure will distinguish reusable OpenTofu modules from Terragrunt live environment composition. A future shape can use paths such as `infra/aws/modules/` for modules and `infra/aws/live/<environment>/<region>/` for environment wiring.

Rationale: modules and live composition have different review risks. Modules define reusable resource patterns, while live Terragrunt configuration decides which environment receives those patterns.

Alternative considered: put all `.tf` and Terragrunt files in a single folder. That is simpler at first but makes later staging/production separation and cost review harder.

### Start with foundation-only configuration

The first implementation should include only files needed to prove layout, formatting, provider/version constraints, local static validation, and documentation. Placeholder modules or no-op foundation files are acceptable when they make validation meaningful, but managed AWS resources must remain out of scope.

Rationale: this change is about conventions and guardrails before resource provisioning. Later changes can add specific capabilities such as ECR, network baseline, EKS, or RDS with their own OpenSpec review.

Alternative considered: create a minimal real AWS resource to prove the workflow. That would conflict with the issue scope and introduce cost, credentials, state, and cleanup risk too early.

### Keep state and credentials assumptions documented, not activated

Remote state, AWS profiles, account IDs, OIDC roles, and secrets handling should be documented as assumptions or future work. Local validation should not require committed backend credentials, personal AWS credentials, a selected AWS account, or a remote state bucket.

Rationale: state and identity are high-impact platform decisions. Treating them as documentation and guardrails now keeps this foundation useful without locking in unsafe defaults.

Alternative considered: configure a real S3/DynamoDB backend immediately. That would require preexisting AWS resources or create a bootstrap problem outside the scope of this change.

### Provide explicit validation without automatic apply

Validation should focus on commands such as formatting, Terragrunt HCL formatting, OpenTofu validation that avoids backend/cloud access where possible, documentation checks, and OpenSpec validation. Makefile targets or npm scripts may wrap these commands, but they must remain thin and must not run `tofu apply` or `terragrunt apply`.

Rationale: contributors need a repeatable local check while the repository must avoid accidental cloud provisioning.

Alternative considered: add an apply-capable convenience target now. That would make accidental infrastructure creation too easy before resource, cost, state, and identity controls exist.

## Risks / Trade-offs

- [Risk] A foundation-only IaC tree can look like production readiness. -> Mitigation: document that this is Level 3 preparation only and does not provision AWS resources.
- [Risk] Placeholder modules can become misleading dead code. -> Mitigation: include only placeholders needed for validation and require later resource changes to replace or extend them through OpenSpec.
- [Risk] Validation commands may accidentally require AWS credentials through backend/provider initialization. -> Mitigation: prefer static checks and document credential-free validation as an acceptance criterion.
- [Risk] Future environment names or account assumptions could drift. -> Mitigation: document naming conventions, tags, and state assumptions in the IaC foundation docs.
- [Risk] Cost controls may be deferred until resources exist. -> Mitigation: require cost guardrails and review checkpoints before any future resource-producing change.

## Migration Plan

No runtime migration is required. Implement the IaC foundation files, documentation, and static validation wrappers. Validate the change with OpenSpec strict validation and any local formatting/static IaC checks that do not require AWS credentials. Do not run apply commands and do not create cloud resources.

## Open Questions

- Which AWS account naming convention and remote state bootstrap process will be accepted for the first resource-producing AWS change?
- Should future AWS changes introduce ECR first as the lowest-risk real resource, or start with account/bootstrap prerequisites before application resources?
