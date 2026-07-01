## Context

FlagForge already has local Docker, PostgreSQL, Helm, kind, Argo CD, Kong, and Prometheus/Grafana practice paths. ADR 0007 accepts AWS as the future Level 3 target architecture with EKS, RDS PostgreSQL, ECR, ALB, IAM/OIDC, Argo CD, Helm, Kong, and observability tooling. ADR 0012 accepts OpenTofu as the IaC runtime and Terragrunt for composition and environment management.

This change starts Level 3 by adding the IaC foundation only. It should make later AWS resource changes easier to review without creating any real AWS infrastructure now.

## Goals / Non-Goals

**Goals:**

- Establish a source-controlled OpenTofu/Terragrunt layout for future AWS work.
- Define conventions for modules, live environments, provider configuration, backend/state assumptions, variable naming, tags, and outputs.
- Provide validation commands for formatting and static checks that can run locally without AWS credentials.
- Document cost, secrets, environment, Security/LGPD, and provisioning guardrails.
- Define security conventions for mandatory tags, least-privilege future IAM/OIDC, local AWS profile usage, and sensitive artifact handling.
- Keep validation, future planning, and future apply behavior explicit and separate.
- Document operational runbook expectations, future remote-state prerequisites, and rollback/cleanup expectations for resource-producing AWS changes.

**Non-Goals:**

- Creating EKS, RDS, ECR, ALB, IAM/OIDC production roles, Route 53, Secrets Manager, monitoring stacks, or any other real AWS resource.
- Adding automatic `apply`, GitHub Actions apply, Atlantis, Terrareg, or remote module registry workflows.
- Adding account-backed `plan`, `apply`, `destroy`, `import`, state mutation, drift remediation, or remote-state bootstrap workflows.
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

### Treat state, plans, logs, and outputs as sensitive artifacts

OpenTofu/Terragrunt state files, generated plan files, command logs, and outputs should be treated as sensitive even before production resources exist. The foundation should document that these artifacts can expose infrastructure topology, generated identifiers, provider metadata, secret references, and potentially LGPD-relevant configuration. Examples, tags, resource names, variable values, and outputs should avoid personal data and production identifiers by default.

Rationale: IaC metadata often becomes an accidental data disclosure path. Treating state and generated artifacts as sensitive from the foundation prevents unsafe habits before remote state and resource-producing workflows exist.

Alternative considered: only block obvious secrets such as access keys. That misses lower-signal sensitive data such as account identifiers, internal topology, personal names in tags, and values captured in plan/state output.

### Require least-privilege future IAM/OIDC assumptions

Future IAM/OIDC work should use short-lived credentials, scoped trust relationships, environment-specific roles, explicit audience/subject constraints where applicable, and least-privilege policies. Future changes must not default to administrator access, wildcard permissions, broad principals, long-lived access keys, or shared personal credentials for automation.

Rationale: IAM/OIDC is a security boundary, not just an implementation detail. Establishing least privilege as a required future criterion keeps account bootstrap, CI plan, and apply workflows reviewable before credentials are introduced.

Alternative considered: defer IAM/OIDC permission details until implementation. That would make it easy for the first account-backed workflow to choose broad access for convenience and normalize unsafe defaults.

### Require mandatory governance tags without sensitive values

The foundation should define a baseline mandatory tag convention for future AWS resources, such as project, environment, managed-by, owner or team, and cost-allocation fields. Tag values must use non-sensitive project/team identifiers and must not include personal data, secrets, real account IDs, customer data, or production-only identifiers in examples.

Rationale: tags are needed for cost allocation, ownership, cleanup, and auditability, but they can also leak sensitive data if treated as free-form labels.

Alternative considered: leave tags as informal documentation. That would make later cost, ownership, and cleanup reviews inconsistent across resources and environments.

### Keep local AWS profiles optional and non-secret

Local AWS profile names may be documented only as placeholders for future account-backed work and must not be required for credential-free validation. Profile names, SSO start URLs, account IDs, credentials, and personal workstation configuration must not be committed in `.env`, `.tfvars`, backend configuration, provider files, generated Terragrunt files, or examples.

Rationale: local profile usage is useful for future manual workflows, but profile names and account metadata can leak environment details and create hidden dependencies in validation commands.

Alternative considered: standardize on one local profile now. That would make validation depend on local account setup before this foundation has a reviewed account or remote-state model.

### Separate validate, plan, and apply workflows

Validation should focus on commands such as formatting, Terragrunt HCL formatting, OpenTofu validation that avoids backend/cloud access where possible, documentation checks, and OpenSpec validation. Makefile targets or npm scripts may wrap these commands, but they must remain thin and must not run account-backed `plan`, `apply`, `destroy`, import, or state mutation commands.

Future `plan` workflows must be introduced by a separate OpenSpec change because they depend on AWS credentials, provider initialization, backend selection, remote state, and cost review. Future `apply` workflows must be separate again from validation and must require explicit human review, no auto-approve defaults, rollback/cleanup documentation, and Staff, SRE, and Security/LGPD review.

Rationale: contributors need a repeatable local check while the repository must avoid accidental cloud provisioning.

Alternative considered: add an apply-capable convenience target now. That would make accidental infrastructure creation too easy before resource, cost, state, and identity controls exist.

### Treat dangerous IaC commands as explicitly out of scope

Default scripts, CI jobs, validation targets, and runbook examples must not execute or encourage commands that can create, modify, destroy, import, unlock, taint, or mutate infrastructure state. This includes `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `terragrunt run-all apply`, `terragrunt run-all destroy`, `tofu import`, `tofu state rm`, `tofu force-unlock`, `tofu taint`, and any `--auto-approve` default.

Rationale: early IaC foundations often become unsafe when convenience wrappers hide side effects. Naming the dangerous command classes keeps validation paths boring and reviewable.

Alternative considered: only prohibit `apply`. That leaves other state-changing or destructive commands available through default wrappers and CI.

### Require an AWS IaC operations runbook

The implementation should add or update an operations runbook for the AWS IaC foundation. The runbook should cover prerequisites, credential-free validation, expected failure modes for missing CLIs or malformed HCL, what not to run, how to validate that no resources were created, and the minimum rollback/cleanup expectations for future resource-producing changes.

Rationale: even a foundation-only IaC tree changes how contributors interact with cloud tooling. A runbook makes the safe path explicit before real resources exist.

Alternative considered: keep all operational guidance in the design and README. That would make day-two procedures harder to find and less consistent with the repository runbook template.

### Keep remote state as a future bootstrap change

Remote state should remain documented as future work in this foundation. The first remote-state change must define bootstrap ownership, S3 bucket and DynamoDB lock-table choices or alternatives, encryption, versioning, access control, recovery, state migration, and state-lock failure handling.

Rationale: remote state is both a reliability and security boundary. It should not appear as an inert-looking placeholder that later becomes production state without review.

Alternative considered: include commented backend configuration now. That can drift into copied production configuration and can make local validation accidentally depend on cloud access.

### Require rollback and cleanup for future resource changes

Future AWS resource-producing changes must document how to reverse the change safely. The rollback plan should distinguish code rollback, planned destroy/cleanup, state recovery, and data-preserving remediation, especially for persistent or shared resources such as RDS, EKS, networking, DNS, and IAM.

Rationale: IaC rollback is not always `destroy`. Some resources carry data, identity, or shared platform dependencies and need explicit recovery paths.

Alternative considered: defer rollback until production deployment. That would allow early AWS resources to accumulate without an accountable cleanup path.

## Risks / Trade-offs

- [Risk] A foundation-only IaC tree can look like production readiness. -> Mitigation: document that this is Level 3 preparation only and does not provision AWS resources.
- [Risk] Placeholder modules can become misleading dead code. -> Mitigation: include only placeholders needed for validation and require later resource changes to replace or extend them through OpenSpec.
- [Risk] Validation commands may accidentally require AWS credentials through backend/provider initialization. -> Mitigation: prefer static checks and document credential-free validation as an acceptance criterion.
- [Risk] Future environment names or account assumptions could drift. -> Mitigation: document naming conventions, tags, and state assumptions in the IaC foundation docs.
- [Risk] Cost controls may be deferred until resources exist. -> Mitigation: require cost guardrails and review checkpoints before any future resource-producing change.
- [Risk] `plan` may be treated as a harmless validation command even though it can require credentials, backend initialization, provider access, and current state. -> Mitigation: keep `plan` out of this foundation and require a later account-backed workflow change.
- [Risk] Future rollback may be reduced to `destroy`, which is unsafe for persistent or shared resources. -> Mitigation: require rollback and cleanup documentation for each resource-producing change.
- [Risk] Remote-state placeholders may become de facto production configuration. -> Mitigation: document remote state as a separate bootstrap decision with locking, encryption, access, and recovery requirements.
- [Risk] State, plan, logs, outputs, tags, or examples can expose sensitive metadata or LGPD-relevant data. -> Mitigation: classify generated IaC artifacts as sensitive, avoid personal data in examples and tags, and require no sensitive outputs.
- [Risk] Future IAM/OIDC workflows may start with broad permissions for convenience. -> Mitigation: require least-privilege roles, scoped trust policies, short-lived credentials, and Security/LGPD review before account-backed workflows.

## Migration Plan

No runtime migration is required. Implement the IaC foundation files, documentation, static validation wrappers, and operations runbook. Validate the change with OpenSpec strict validation and any local formatting/static IaC checks that do not require AWS credentials. Do not run `plan`, `apply`, `destroy`, import, state mutation, or other account-backed commands, and do not create cloud resources.

## Open Questions

- Which AWS account naming convention and remote state bootstrap process will be accepted for the first resource-producing AWS change?
- Which exact mandatory tag set should be accepted for all future AWS resources?
- Which IAM/OIDC trust-policy shape should be accepted for the first account-backed GitHub Actions or local plan workflow?
- Should future AWS changes introduce ECR first as the lowest-risk real resource, or start with account/bootstrap prerequisites before application resources?
- What monthly-cost estimate format should future AWS resource-producing changes use?
- Which rollback evidence should be required before resource-producing AWS changes are considered complete?
