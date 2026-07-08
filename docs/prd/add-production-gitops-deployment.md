# PRD: add-production-gitops-deployment

## Problem

FlagForge has a Level 3 AWS target direction and now has foundations for AWS
IaC, RDS PostgreSQL, ECR image publishing, EKS and ALB runtime infrastructure,
Helm packaging, and local Argo CD GitOps practice. The next product gap is a
production-style GitOps deployment path that ties these foundations together
without changing application feature behavior.

Without an explicit production GitOps requirement, future deployment work may
mix desired-state layout, environment configuration, image promotion, Argo CD
sync behavior, validation, rollback, secrets, and infrastructure provisioning
into one unclear increment. That would make the Level 3 AWS path harder to
review and could blur the boundary between application delivery, platform
contracts, and account-backed cloud operations.

## Goals

- Define the desired-state structure for deploying FlagForge to the Level 3 AWS
  `dev` target through GitOps.
- Establish how environment-specific configuration is represented without
  committing secrets, real account IDs, personal data, customer data, or
  production-only identifiers.
- Make the production-style deployment path consume existing EKS/ALB, RDS, ECR,
  Helm, and Argo CD contracts instead of redefining those foundations.
- Document promotion from a reviewed image reference into desired state.
- Document validation, drift inspection, sync health, rollback, and cleanup
  expectations for the first AWS GitOps deployment workflow.
- Keep application feature behavior, public API behavior, database schema, and
  local platform behavior unchanged.
- Keep default repository verification independent from AWS credentials, remote
  state, kubeconfig access, live EKS, Argo CD, Docker, or cloud resources.
- Identify Staff, SRE, Security/LGPD, and QA review gates before implementation.

## Non-goals

- Creating prerequisite AWS resources such as EKS, ALB, RDS, ECR, networking,
  IAM/OIDC, remote state, DNS, TLS, or observability infrastructure.
- Creating or changing Helm packaging beyond AWS deployment values required for
  this GitOps path.
- Creating the ECR image publishing contract or changing its tag strategy.
- Creating the RDS PostgreSQL contract or changing database schema,
  migrations, backup policy, or credential ownership.
- Creating the EKS/ALB runtime contract or changing cluster, ingress,
  networking, or IAM foundation behavior.
- Application feature changes, public API contract changes, or OpenAPI changes.
- Authentication, authorization, tenancy, environments as an application domain
  feature, SDKs, or segment management.
- Multi-region design, blue-green deployment, canary analysis, production SLOs,
  or automated progressive delivery.
- Automatic account-backed `plan`, `apply`, `destroy`, import, state mutation,
  kubeconfig generation, Argo CD admin bootstrap, or cluster mutation from
  default local verification.
- Claiming production readiness for real customer traffic.

## Users

- Contributors implementing Level 3 AWS delivery and GitOps increments.
- Developers promoting a reviewed FlagForge image into the AWS `dev`
  desired-state target.
- Staff reviewers assessing scope boundaries, dependency handoff, and alignment
  with accepted AWS, Helm, Argo CD, and CI decisions.
- SRE reviewers assessing deployment reliability, sync health, drift,
  rollback, cleanup, observability assumptions, and operational runbooks.
- Security and LGPD reviewers assessing secrets, Argo CD access, cluster access,
  repository contents, image references, logs, and metadata exposure.
- QA reviewers assessing validation coverage for desired state, promotion,
  deployment health, rollback, and regression boundaries.

## Requirements

- OpenSpec artifacts must define the production-style GitOps deployment
  workflow before implementation under the requested change id
  `add-production-gitops-deployment`.
- The GitOps deployment path must align with the accepted Level 3 AWS target,
  Helm packaging, Argo CD delivery, and GitHub Actions quality-gate decisions.
- Desired state must live in a source-controlled, infrastructure-oriented path
  that makes the AWS GitOps target easy to distinguish from local Argo CD
  desired state.
- Desired state must consume the existing FlagForge Helm chart and AWS-specific
  values rather than reimplementing Kubernetes workload manifests by hand.
- The first target environment must be documented as the non-production AWS
  `dev` learning target in `us-east-1`, unless the OpenSpec change explicitly
  resolves a different first target before implementation.
- Environment-specific configuration must distinguish safe committed values from
  external secret references and account-backed values that are prerequisites.
- Source-controlled examples must avoid real AWS account IDs, credentials,
  kubeconfigs, tokens, Argo CD admin secrets, personal data, customer data,
  production-only identifiers, copied cloud outputs, and live secret values.
- The workflow must consume the documented ECR image URI shape and tag strategy,
  including commit-addressable tags such as `<yyyymmdd>.<short-sha>`.
- Desired state must not rely on mutable-only image tags such as `latest` as the
  only deployable reference.
- Promotion documentation must explain how a reviewed image tag becomes the
  desired image for the AWS `dev` GitOps target.
- Promotion documentation must distinguish pull request validation, merge to the
  desired-state branch or path, and any manual approval or environment
  protection required before Argo CD sync.
- CI or validation documentation must explain which checks prove desired-state
  syntax, Helm rendering, OpenSpec alignment, and repository quality before sync.
- Default `npm run verify` must remain host-only and must not require AWS
  credentials, remote state, kubeconfig access, a live cluster, Argo CD, Docker,
  ECR, RDS, ALB, or cloud resources.
- Any live sync, live health check, kubeconfig, Argo CD CLI, or account-backed
  validation command must be separate, explicit, documented, and safe to skip in
  the default local verification path.
- The deployment workflow must consume existing EKS/ALB handoff references for
  cluster, namespace, ingress, load balancer, OIDC, and network assumptions
  without redefining the runtime foundation.
- The deployment workflow must consume existing RDS handoff references for
  database endpoint, port, database name, username reference, password reference,
  TLS expectation, and migration expectation without committing secrets.
- The deployment workflow must document how Kubernetes or Argo CD secret inputs
  are expected to be provided, while keeping production secret management as a
  separate reviewed concern unless this OpenSpec change explicitly narrows it.
- The deployment workflow must document how ALB ingress exposure is validated at
  the product level without changing public API semantics.
- The deployment workflow must document how Argo CD sync status, application
  health, Kubernetes rollout status, and FlagForge health endpoints are used to
  validate a deployment.
- Rollback documentation must explain how to revert desired state to a prior
  known-good image tag or configuration revision.
- Rollback documentation must distinguish GitOps desired-state rollback from
  infrastructure cleanup, database rollback, or code rollback.
- Drift inspection documentation must explain how contributors can identify
  differences between source-controlled desired state and live cluster state.
- Cleanup documentation must describe how to remove or disable the GitOps
  application target without implying that code rollback destroys AWS resources.
- The change must document operational ownership for failed sync, unhealthy
  application status, failed rollout, unavailable ingress, missing image,
  missing database secret, or rejected Argo CD access.
- The workflow must not introduce broad cluster-admin defaults, long-lived AWS
  credentials, committed kubeconfigs, committed Argo CD credentials, or copied
  cloud tokens.
- Logs, rendered manifests, workflow outputs, screenshots, and examples must
  avoid leaking secrets, token values, personal data, customer data, real account
  IDs, or sensitive infrastructure metadata.
- Documentation must identify Staff, SRE, Security/LGPD, and QA review gates
  before the change is considered ready for implementation.

## Risks

- Desired-state structure can drift from the local Argo CD pattern if the AWS
  path invents a separate deployment model instead of extending the established
  Helm and Argo CD conventions.
- Promotion can become ambiguous if image tags, branch protection, environment
  protection, and Argo CD sync ownership are not explicit.
- A GitOps deployment can appear production-ready for real traffic before
  account-backed prerequisites, observability, security controls, and operating
  practices are mature.
- Committed examples can accidentally expose account IDs, copied kubeconfigs,
  Argo CD credentials, database secret values, cloud metadata, or production-only
  identifiers.
- Live validation can creep into default verification and make local development
  depend on AWS credentials or cluster availability.
- Rollback expectations can be misleading if they do not distinguish reverting
  desired state from database recovery or infrastructure cleanup.
- Argo CD access and cluster permissions can become too broad if least-privilege
  assumptions are not reviewed.
- Deployment health checks can give false confidence if they only check Argo CD
  sync status and do not include workload rollout and FlagForge health signals.
- Future changes can redefine ECR, RDS, EKS, ALB, or Helm contracts if this
  deployment PRD does not make dependency handoffs explicit.

## Resolved decisions

- The OpenSpec change id requested by GitHub issue #29 is
  `add-production-gitops-deployment`.
- The deployment path is production-style Level 3 AWS `dev` GitOps practice, not
  a claim of production readiness for real customer traffic.
- Argo CD is the GitOps delivery tool, aligned with ADR 0010.
- Helm remains the packaging layer consumed by GitOps desired state, aligned
  with ADR 0009.
- GitHub Actions remains the CI and quality-gate automation surface, aligned
  with ADR 0014.
- The workflow builds on the accepted AWS target architecture from ADR 0007.
- The GitOps deployment change consumes existing AWS IaC, EKS/ALB, RDS, ECR,
  Helm, and local Argo CD foundations rather than creating those prerequisites.
- Promotion uses reviewed, commit-addressable ECR image references rather than
  mutable-only tags.
- Default local verification remains independent from live AWS and Kubernetes
  resources.
- Staff, SRE, Security/LGPD, and QA review are required before implementation.

## Open questions

- Should the first AWS GitOps target auto-sync in Argo CD after merge, or should
  sync remain manual for the first Level 3 deployment increment?
- Which Git branch, path, or environment protection rule is the source of truth
  for promoting the AWS `dev` desired-state target?
- Should this change include a live AWS GitOps smoke command, or only document
  the command shape until account-backed Argo CD and EKS access are available?
- What is the minimum accepted secret reference pattern for the first AWS GitOps
  target if production secret management remains a separate future concern?

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/29
- OpenSpec change id requested by issue:
  `add-production-gitops-deployment`
- Relevant docs:
  `docs/adr/0007-use-level-3-aws-platform-as-future-production-target.md`,
  `docs/adr/0009-use-helm-for-kubernetes-packaging.md`,
  `docs/adr/0010-use-argocd-for-gitops-delivery.md`,
  `docs/adr/0014-use-github-actions-for-ci-and-quality-gates.md`, and
  `docs/context/delivery-workflow.md`
- Prerequisite and related capabilities:
  `openspec/specs/aws-iac-foundation/spec.md`,
  `openspec/specs/aws-eks-alb-runtime/spec.md`,
  `openspec/specs/aws-rds-postgresql/spec.md`,
  `openspec/specs/ecr-image-publishing/spec.md`,
  `openspec/specs/local-helm-packaging/spec.md`, and
  `openspec/specs/local-argocd-gitops/spec.md`
