## 1. Workflow Configuration

- [ ] 1.1 Add a dedicated GitHub Actions image publishing workflow separate from the existing CI workflow.
- [ ] 1.2 Configure the publish workflow for protected `main` branch pushes and `workflow_dispatch` only, with no pull request publishing path.
- [ ] 1.3 Configure minimal GitHub workflow permissions and the `aws-dev` environment for publish-capable runs.
- [ ] 1.4 Add an explicit activation guard such as `ECR_PUBLISHING_ENABLED=true` so automatic `main` branch runs skip ECR authentication and push until future AWS prerequisites are provisioned and reviewed.
- [ ] 1.5 Add OIDC-based AWS role assumption placeholders for `flagforge-github-actions-ecr-publisher-dev` without committed AWS keys or account-specific secrets.
- [ ] 1.6 Build and tag the Docker image from the repository root as `flagforge-api` using the `<yyyymmdd>.<short-sha>` tag format.
- [ ] 1.7 Add Trivy image scanning before ECR login and push, failing on high or critical findings.
- [ ] 1.8 Add ECR login and publish steps using placeholder account configuration and `us-east-1`, gated behind the activation setting and scan success.

## 2. CI Safety Boundaries

- [ ] 2.1 Confirm the existing CI workflow still builds the Docker image without publishing it to any registry.
- [ ] 2.2 Confirm pull request workflows do not assume AWS credentials or publish-capable permissions.
- [ ] 2.3 Confirm `npm run verify` remains host-only and does not require Docker, AWS credentials, ECR access, remote state, or live cloud resources.
- [ ] 2.4 Confirm the publish workflow skips ECR authentication and push when the activation setting is absent or not `true`.
- [ ] 2.5 Document and validate the expected protected `main` branch and `aws-dev` GitHub environment protection settings before publish activation is accepted.

## 3. Documentation

- [ ] 3.1 Document the ECR image contract: repository `flagforge-api`, environment `dev`, region `us-east-1`, and URI shape `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:<tag>`.
- [ ] 3.2 Document the tag strategy, including the `20260704.abcd123` example and the rule that mutable-only tags such as `latest` are not sufficient deployable references.
- [ ] 3.3 Document GitHub Actions OIDC assumptions, the placeholder publisher role, least-privilege ECR permission expectations, `aws-dev` environment protection expectations, protected `main` assumptions, and the prohibition on long-lived AWS keys.
- [ ] 3.4 Document that ECR repository provisioning, lifecycle policy enforcement, IAM/OIDC resource creation, branch/environment protection enforcement, enabling `ECR_PUBLISHING_ENABLED`, account-backed plans, and applies are prerequisites for a future OpenSpec change.
- [ ] 3.5 Document Trivy image scanning expectations, high and critical blocking behavior before ECR push, and Security/LGPD review ownership.
- [ ] 3.6 Document retention, cleanup, cost, and rollback expectations, including keeping the last three tagged images and deleting older untagged images after seven days.
- [ ] 3.7 Document future EKS, Helm, and Argo CD handoff requirements for consuming a specific published image tag or prior known-good image reference.
- [ ] 3.8 Document required Staff, SRE, Security/LGPD, and QA review gates before implementation is considered ready.

## 4. Validation

- [ ] 4.1 Validate GitHub Actions workflow syntax or run the closest available local/static workflow check without requiring AWS credentials.
- [ ] 4.2 Validate that workflow conditions keep ECR authentication and push skipped when `ECR_PUBLISHING_ENABLED` is absent or not `true`.
- [ ] 4.3 Run `openspec validate --all --strict` and fix any issues introduced by this change.
- [ ] 4.4 Run `npm run verify` and confirm the local completion gate remains independent from AWS, ECR, Docker, remote state, and live cloud resources.
