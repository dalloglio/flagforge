## Why

FlagForge needs a stable AWS container image publishing path before future EKS, Helm, or Argo CD work can consume it as a deployable workload. Defining ECR naming, tagging, authentication, vulnerability, retention, and rollback expectations now keeps registry publishing separate from later cluster deployment and production rollout changes.

## What Changes

- Define AWS Elastic Container Registry as the target registry for FlagForge application images.
- Document the first image repository and image URI contract for future deployment consumers.
- Introduce a publish-capable GitHub Actions workflow for protected `main` branch pushes and manual `workflow_dispatch` runs, guarded by an explicit activation variable so automatic publishing remains disabled until AWS prerequisites are provisioned and reviewed.
- Keep pull request validation and normal quality checks non-publishing, including the existing Docker image build validation.
- Require short-lived GitHub Actions to AWS authentication, such as OIDC with a least-privilege ECR publisher role.
- Define image tags using a date plus short commit SHA format, with commit-addressable provenance and no reliance on ambiguous production-only tags as the only deployable reference.
- Define pre-push Trivy image scanning, reviewer expectations, rollback, retention, cleanup, cost, and sensitive-data guardrails for published images.
- Record ECR repository provisioning as a prerequisite for a future OpenSpec change rather than creating ECR IaC in this change.
- Exclude EKS deployment, ALB, ingress, DNS, TLS, production rollout, Argo CD production sync, public API changes, and application feature behavior changes.

## Capabilities

### New Capabilities

- `ecr-image-publishing`: Defines the AWS ECR image publishing contract, repository naming, image tagging, registry authentication, vulnerability gates, retention, rollback, and future deployment handoff requirements.

### Modified Capabilities

- `ci-quality`: Clarifies that existing pull request and quality CI remains validation-only while publish-capable GitHub Actions events are separated and gated.

## Impact

- Affected systems: GitHub Actions, AWS ECR, future EKS/Helm/Argo CD deployment consumers, and repository documentation.
- Affected code and configuration: `.github/workflows/`, `README.md`, relevant runbooks or AWS delivery docs, and OpenSpec specs.
- No public API behavior changes are introduced.
- `npm run verify` remains host-only and must not require AWS credentials, ECR access, Docker, remote state, or live cloud resources.
- ECR repository provisioning, account-backed plans, applies, destroys, imports, remote state, EKS, ALB, production traffic routing, and enabling automatic main-branch publishing remain outside this implementation scope.
