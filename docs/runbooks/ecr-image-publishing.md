# ECR Image Publishing Runbook

## Service

FlagForge API container image publishing to AWS Elastic Container Registry for the future Level 3 AWS delivery path.

## Purpose

This runbook documents the image publishing contract, activation prerequisites, validation boundaries, rollback expectations, and review gates for publishing the FlagForge API image to ECR. The workflow defines a publish path but remains disabled until future account-backed AWS prerequisites are provisioned and reviewed.

## Image Contract

- Registry target: AWS Elastic Container Registry.
- Repository: `flagforge-api`.
- Environment: `dev`.
- Region: `us-east-1`.
- Image URI shape: `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:<tag>`.
- First tag format: `<yyyymmdd>.<short-sha>`, for example `20260704.abcd123`.

Future EKS, Helm, and Argo CD changes must consume a specific published tag or another reviewed immutable reference. Mutable-only tags such as `latest` are not sufficient as the only deployable reference.

## Activation Prerequisites

The workflow file is `.github/workflows/publish-ecr-image.yml`. It is publish-capable only for protected `main` branch pushes and manual `workflow_dispatch` runs, and it does not run for pull request events.

Publishing is disabled unless `ECR_PUBLISHING_ENABLED=true` is configured as a repository or `aws-dev` environment variable. The workflow checks this setting after the `aws-dev` environment is declared so protected environment variables can activate publishing; when it is absent or not `true`, Docker build, Trivy scanning, AWS authentication, ECR login, and image push steps are skipped. Do not enable this variable until a future account-backed OpenSpec change provisions and reviews:

- ECR repository `flagforge-api`.
- ECR lifecycle policy.
- GitHub Actions OIDC provider and IAM role `flagforge-github-actions-ecr-publisher-dev`.
- Repository or environment variable `AWS_ACCOUNT_ID`.
- Protected `main` branch settings.
- GitHub environment `aws-dev` protection settings.

This change does not create ECR IaC, run account-backed plans, run applies, create remote state, deploy EKS, configure ALB or ingress, or route production traffic.

## Authentication and Authorization

The publishing workflow uses GitHub Actions OIDC to assume the `flagforge-github-actions-ecr-publisher-dev` role. It must not use committed AWS keys, shared personal credentials, copied cloud tokens, or personal workstation credentials.

The future IAM role policy should be limited to the minimum ECR actions needed for `flagforge-api`, including:

- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`
- `ecr:PutImage`
- `ecr:DescribeImages`
- `ecr:DescribeImageScanFindings`

Do not use administrator policies, broad principals, wildcard resource access, or long-lived credentials as defaults.

## Vulnerability Gate

The workflow builds the local Docker image, runs Trivy against that local image, and fails before ECR login or push when high or critical vulnerabilities are found.

Security/LGPD review is required before accepting CI-to-AWS identity or publishing capability. The review must cover registry access, OIDC trust, secrets, logs, vulnerability visibility, image metadata, and account identifier handling.

## Retention Cost and Cleanup

Expected ECR lifecycle behavior for the future provisioning change:

- Keep the last three tagged images.
- Delete older untagged images after seven days.
- Review retention and cleanup before enabling publishing.

ECR storage cost is a known concern. Lifecycle policy enforcement belongs to the future ECR provisioning change, not this workflow-only change.

## Rollback and Handoff

Rollback for this workflow is to unset `ECR_PUBLISHING_ENABLED`, disable the workflow, or remove the workflow while continuing to use normal CI validation.

Rollback for future deployments is to select a prior known-good `<yyyymmdd>.<short-sha>` image tag. Future deployment work must not depend on mutable-only tags for rollback.

## Validation

Before implementation is considered ready:

- Confirm `.github/workflows/ci.yml` still builds the Docker image without publishing.
- Confirm pull request workflows do not assume AWS credentials or publish images.
- Confirm `npm run verify` does not require AWS credentials, ECR access, Docker, remote state, or live cloud resources.
- Confirm the publish workflow skips ECR authentication and push unless `ECR_PUBLISHING_ENABLED=true`.
- Validate the publish workflow syntax or run the closest available static check without AWS credentials.
- Run `openspec validate --all --strict`.
- Run `npm run verify`.

## Review Gates

Before enabling publishing:

- Staff review covers image and versioning strategy.
- SRE review covers publishing reliability, retention, cleanup, cost, and rollback.
- Security/LGPD review covers registry access, CI identity, vulnerability gates, secrets, logs, and metadata exposure.
- QA review covers validation of the build and publish path.
