# PRD: add-ecr-and-image-publishing

## Problem

FlagForge has a Docker and CI foundation, local Kubernetes practice path, and
AWS Level 3 target direction, but it does not yet have a defined path for
publishing the application container image to AWS Elastic Container Registry
(ECR). Future EKS deployment work needs a reviewable image source, tag contract,
and registry access model before it can consume FlagForge as a deployable
workload.

Without an ECR and image publishing requirement, deployment work may mix image
versioning, registry provisioning, CI credentials, rollback expectations, and
cluster consumption details into later EKS or GitOps changes. That would make
the AWS delivery path harder to review and could weaken the existing separation
between CI verification, infrastructure provisioning, and production-style
deployment.

## Goals

- Define the AWS container registry target for FlagForge application images.
- Establish a documented image naming and tag strategy for future deployment
  consumers.
- Add or define a GitHub Actions publishing workflow that builds on the existing
  CI foundation.
- Use safe AWS authentication assumptions for CI, favoring short-lived
  GitHub-to-AWS identity integration over committed or long-lived credentials.
- Keep ECR and image publishing scoped as preparation for future EKS deployment,
  not as deployment or production rollout.
- Preserve the existing local Docker build and host-only `npm run verify`
  workflow.
- Document rollback, retention, cleanup, cost, and review expectations for
  published images.
- Provide clear handoff requirements for future EKS, Helm, and Argo CD changes
  that need to consume the published image.

## Non-goals

- EKS cluster deployment.
- ALB, ingress, DNS, TLS, or production traffic routing.
- Production rollout or runtime operations.
- Argo CD production sync.
- Helm chart behavior changes beyond documenting future image consumption needs.
- Application feature behavior changes.
- Public API contract changes.
- Authentication, authorization, tenancy, environments, SDKs, or segment
  management.
- Long-lived AWS access keys, copied cloud credentials, or personal workstation
  credentials in CI.
- Automatic AWS apply, destroy, import, or state-mutating workflows unless a
  separate OpenSpec change explicitly introduces them.

## Users

- Contributors implementing Level 3 AWS delivery and CI/CD increments.
- Developers preparing release candidates or reviewable image builds.
- Staff reviewers assessing image versioning, deployment handoff, and scope
  boundaries.
- SRE reviewers assessing publishing reliability, rollback, retention, cleanup,
  and future deployment implications.
- Security and LGPD reviewers assessing registry access, CI identity, secrets,
  image contents, logs, and metadata exposure.
- QA reviewers assessing validation of the build and publish path.
- Future EKS, Helm, and Argo CD changes that need a stable image reference.

## Requirements

- OpenSpec artifacts must define the ECR and image publishing behavior before
  implementation under the requested change id
  `add-ecr-and-image-publishing`.
- The registry target must be AWS Elastic Container Registry, aligned with the
  accepted Level 3 AWS target architecture.
- The change must document the image repository naming convention, including how
  the FlagForge application image is identified by future deployment consumers.
- The change must document an image tagging strategy that supports at least a
  commit-addressable tag and a human-reviewable release or branch-related tag.
- The tag strategy must avoid ambiguous production-only tags as the only
  deployable reference.
- The publishing workflow must build on the existing Docker image build
  foundation and must not replace local Docker build validation.
- The publishing workflow must run through GitHub Actions or explicitly document
  why publishing is manual for the first increment.
- The workflow must distinguish pull request validation from publish-capable
  events so untrusted pull request code cannot publish images.
- The workflow must call canonical repository commands or documented Docker
  commands where practical instead of duplicating build internals in workflow
  YAML.
- `npm run verify` must remain host-only and must not require AWS credentials,
  ECR access, Docker, remote state, or live cloud resources.
- Existing CI validation must continue to build the Docker image without
  publishing during normal pull request quality checks unless the OpenSpec
  change defines a narrower safe exception.
- Registry authentication must use short-lived credentials, such as GitHub
  Actions OIDC with a scoped AWS role, or document an equivalent safe model.
- The workflow must not require committed AWS access keys, shared personal
  credentials, account-specific values, production-only identifiers, or copied
  cloud tokens.
- IAM assumptions must be least-privilege and scoped to the minimum ECR actions
  needed for image publishing.
- The change must document which AWS account, region, environment, and repository
  values are placeholders versus future account-backed configuration.
- ECR provisioning ownership must be explicit: either this change introduces the
  ECR repository through the selected OpenTofu/Terragrunt IaC path, or it records
  the repository as a prerequisite managed by a separate OpenSpec change.
- If this change introduces ECR IaC, the IaC must live in the AWS infrastructure
  area, such as `infra/aws/`, and must not be embedded in application runtime
  code.
- If this change introduces ECR IaC, credential-free static validation must
  remain separate from account-backed plan or apply workflows.
- The change must document image scanning, vulnerability visibility, and
  reviewer expectations at the level needed for Security/LGPD and SRE review.
- The change must document retention and cleanup expectations for tags and
  untagged images so ECR storage cost does not grow without review.
- The change must document rollback expectations for future deployment consumers,
  including how a prior known-good image reference can be selected.
- Published image references must not expose secrets, personal data, customer
  data, real account IDs in examples, or production-only identifiers unless a
  future reviewed change explicitly requires them.
- Logs, build metadata, workflow outputs, and registry documentation must avoid
  leaking secrets, tokens, or sensitive infrastructure metadata.
- Future EKS deployment work must be able to consume the image reference without
  redefining the registry, tag, and authentication contract.
- Documentation must identify Staff, SRE, Security/LGPD, and QA review gates
  before the change is considered ready for implementation.

## Risks

- Publishing from the wrong GitHub Actions event can let untrusted pull request
  code push images.
- Long-lived AWS keys or broad IAM policies can weaken the CI credential model.
- Ambiguous tags such as a mutable-only `latest` tag can make rollback,
  provenance, and deployment review harder.
- ECR provisioning scope can drift into broader AWS networking, EKS, ALB, or
  production deployment work if boundaries are not explicit.
- Registry costs can grow if tag retention and cleanup expectations are not
  defined.
- Image scanning results can create unresolved release questions if severity
  thresholds and review ownership are not documented.
- CI can become brittle if image build and publish logic diverge from canonical
  repository commands.
- Examples can accidentally expose account IDs, profile names, credentials, or
  production-only identifiers.
- Future deployment changes can couple to unstable image names or tag semantics
  if the handoff contract is underspecified.

## Resolved decisions

- The registry target is AWS ECR, aligned with ADR 0007 and GitHub issue #27.
- GitHub Actions is the expected automation surface, aligned with ADR 0014.
- Image publishing prepares for future EKS deployment but does not deploy the
  application to EKS.
- The existing local verification gate remains independent from AWS and registry
  access.
- Pull request image build validation and publish-capable workflows are separate
  concerns.
- Security/LGPD review is required before any CI-to-AWS identity or publish
  capability is accepted.
- ECR repository provisioning is a prerequisite for a future OpenSpec change;
  this change documents the image publishing contract and prerequisite but does
  not create ECR IaC.
- The first publish-capable events are protected `main` branch pushes and manual
  `workflow_dispatch` runs.
- Published images use a date plus short commit SHA tag, such as
  `20260704.abcd123`.
- The first publish workflow must block publishing on high and critical image
  vulnerability findings.
- The expected ECR retention policy is to keep the last three tagged images and
  delete older untagged images after seven days.
- Account-backed publishing examples use placeholder account value
  `<aws-account-id>`, region `us-east-1`, environment `dev`, ECR repository
  `flagforge-api`, GitHub OIDC role
  `flagforge-github-actions-ecr-publisher-dev`, GitHub environment `aws-dev`,
  and image URI shape
  `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:20260704.abcd123`.

## Open questions

None for PRD approval. The OpenSpec change must carry the resolved decisions
above into proposal, design, specs, and tasks before implementation.

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/27
- OpenSpec change id requested by issue: `add-ecr-and-image-publishing`
- Relevant docs:
  `docs/adr/0007-use-level-3-aws-platform-as-future-production-target.md`,
  `docs/adr/0014-use-github-actions-for-ci-and-quality-gates.md`, and
  `docs/context/delivery-workflow.md`
- Related foundation: `docs/prd/add-docker-and-ci.md`
- Current AWS guardrails: `openspec/specs/aws-iac-foundation/spec.md`
