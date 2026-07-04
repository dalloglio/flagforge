## Context

FlagForge already has a Docker image, Docker build validation in GitHub Actions, and an accepted Level 3 AWS target architecture that includes ECR, EKS, IAM/OIDC, Helm, and Argo CD. Future deployment work needs a stable image source before it can reference the application from EKS, but this change must not provision AWS resources or deploy the application.

The current CI workflow runs on pushes and pull requests, builds the application, and builds `flagforge-api:ci` without publishing. The new publishing path must preserve that validation behavior, add a separate publish-capable workflow, and keep `npm run verify` independent from AWS, ECR, Docker, remote state, and live cloud resources.

Stakeholders are contributors preparing Level 3 AWS delivery increments, Staff reviewers assessing image contract stability, SRE reviewers assessing rollback and reliability, Security/LGPD reviewers assessing CI-to-AWS access and sensitive metadata handling, and QA reviewers assessing validation coverage.

## Goals / Non-Goals

**Goals:**

- Define AWS ECR as the registry target for FlagForge API images.
- Document the image URI shape `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:<tag>` using placeholder account values.
- Publish from trusted GitHub Actions events only: protected `main` branch pushes and manual `workflow_dispatch` runs.
- Use short-lived GitHub Actions OIDC credentials with a scoped AWS role named `flagforge-github-actions-ecr-publisher-dev` and GitHub environment `aws-dev`.
- Tag published images with a date plus short commit SHA, such as `20260704.abcd123`, and retain commit-addressable provenance.
- Block publishing when high or critical image vulnerability findings are present.
- Document retention, cleanup, rollback, cost, sensitive-data, and future deployment handoff expectations.

**Non-Goals:**

- Provisioning ECR repositories, IAM roles, remote state, or other AWS resources.
- Running OpenTofu or Terragrunt plan/apply/destroy/import workflows.
- Deploying to EKS, ALB, ingress, DNS, TLS, or production traffic paths.
- Introducing Helm chart behavior changes, Argo CD production sync, or runtime application behavior changes.
- Requiring AWS credentials, Docker, ECR access, or live cloud resources from `npm run verify`.

## Decisions

1. Use a dedicated publish workflow instead of extending the existing CI job to push images.

   Rationale: pull request validation must remain safe for untrusted code and must continue to build the image without publishing. A separate workflow makes publish-capable events, permissions, environment protections, and AWS role assumptions easier to review.

   Alternatives considered: adding conditional publish steps to `.github/workflows/ci.yml`. This was rejected because it mixes quality validation with cloud publication and makes event gating harder to audit.

2. Treat ECR repository provisioning as a prerequisite managed by a future OpenSpec change.

   Rationale: the current AWS IaC foundation explicitly avoids ECR and resource-producing work. This change can define the publish contract and workflow shape without introducing account-backed infrastructure mutation.

   Alternatives considered: adding OpenTofu/Terragrunt ECR IaC in this change. This was rejected to keep registry publishing separate from AWS provisioning, IAM/OIDC automation, remote state, and account-backed applies.

3. Use GitHub Actions OIDC with a least-privilege ECR publisher role.

   Rationale: short-lived federated credentials avoid committed access keys and align with the AWS guardrails for future IAM/OIDC work. The role must be environment-specific and scoped to the minimum ECR actions needed to authenticate, upload layers, push manifests, and read scan findings for `flagforge-api`.

   Alternatives considered: long-lived AWS access keys in repository secrets or personal workstation credentials. These are rejected because they increase credential exposure risk and conflict with the security guardrails.

4. Use date plus short SHA tags as the first stable tag strategy.

   Rationale: tags such as `20260704.abcd123` are human-reviewable, commit-addressable, and suitable for selecting a prior known-good image. Mutable-only tags such as `latest` are not sufficient as deployable references because they weaken provenance and rollback.

   Alternatives considered: semantic version tags only. This remains future-compatible but is not required for the first registry publishing increment.

5. Gate publish completion on high and critical vulnerability findings.

   Rationale: publishing should not create a deployable image reference when severe image findings are already visible. The workflow should build the image, authenticate to ECR, push or prepare for scan according to the selected scanner behavior, and fail before accepting the publish result when high or critical findings are present.

   Alternatives considered: warning-only scan output. This was rejected for the first publish workflow because it creates unresolved release risk without a clear review owner.

6. Keep local verification host-only and unchanged.

   Rationale: `npm run verify` is the repository completion gate for code quality and OpenSpec validation. Registry publishing depends on account configuration and must remain outside that host-only gate.

   Alternatives considered: adding Docker or AWS checks to `npm run verify`. This was rejected because it would make routine local completion depend on external services.

## Risks / Trade-offs

- Untrusted pull request code could publish an image if event filters or permissions are too broad -> use a dedicated workflow with trusted events only, environment protection, explicit permissions, and no publish credentials in pull request jobs.
- ECR or IAM prerequisites may not exist when the workflow is introduced -> document placeholder configuration and fail clearly until the future account-backed prerequisite change provisions the repository and role.
- Vulnerability scanning behavior may vary by scanner timing or AWS configuration -> document the selected gate and require Security/LGPD review before accepting publish capability.
- Date plus SHA tags are not release semantics -> preserve provenance now and leave semantic versioning or release tags for a future release-management change.
- Retention rules cannot be enforced without ECR repository policy provisioning -> document the expected policy now and require the future ECR IaC change to implement it.
- Publishing costs can grow if cleanup is not implemented later -> keep retention expectations explicit: keep the last three tagged images and delete older untagged images after seven days.
- Examples can leak account or infrastructure metadata -> use placeholder account IDs and avoid real account IDs, secrets, profile names, production-only identifiers, or personal data.

## Migration Plan

1. Add a publish workflow and documentation using placeholder account and role values.
2. Keep existing CI validation and Docker build behavior intact.
3. Validate workflow syntax and documentation without requiring live AWS credentials.
4. In a future OpenSpec change, provision the ECR repository, lifecycle policy, IAM/OIDC role, and any account-backed configuration.
5. After prerequisites exist, run `workflow_dispatch` from the protected environment to publish a test image and record the resulting image reference.
6. Future EKS, Helm, or Argo CD changes consume the documented immutable image tag or a selected prior known-good image reference.

Rollback for this change is to disable or remove the publish workflow and continue using existing pull request validation. Rollback for future deployments is to select a prior known-good date plus SHA image tag rather than relying on a mutable tag.

## Open Questions

None for this proposal. Account-specific values, ECR provisioning, IAM/OIDC resource creation, and lifecycle policy enforcement are intentionally deferred to a future OpenSpec change.
