## Why

FlagForge now has Level 3 AWS direction plus contracts for IaC, RDS PostgreSQL,
ECR image publishing, EKS/ALB runtime infrastructure, Helm packaging, and local
Argo CD practice. The next gap is a production-style GitOps deployment path that
ties those foundations together for the AWS `dev` learning target without
changing application feature behavior.

## What Changes

- Add source-controlled AWS `dev` GitOps desired state that is distinct from the
  local Argo CD desired state.
- Define how the AWS GitOps target consumes the existing FlagForge Helm chart,
  AWS-specific values, ECR image reference contract, EKS/ALB handoff, and RDS
  PostgreSQL handoff.
- Document promotion from a reviewed commit-addressable ECR image tag into the
  AWS `dev` desired-state target.
- Document pull request validation, sync and health inspection, product-level
  ingress validation, drift inspection, rollback, cleanup, and failure ownership.
- Keep secrets, real account IDs, kubeconfigs, Argo CD credentials, cloud tokens,
  personal data, customer data, and production-only identifiers out of committed
  desired state, examples, logs, and rendered outputs.
- Keep default local verification host-only and independent from AWS
  credentials, remote state, kubeconfig access, live EKS, Argo CD, Docker, ECR,
  RDS, ALB, or cloud resources.
- Require Staff, SRE, Security/LGPD, and QA review before implementation.

## Capabilities

### New Capabilities

- `production-gitops-deployment`: Production-style Level 3 AWS `dev` GitOps
  desired state, promotion, validation, rollback, drift, cleanup, and review
  requirements.

### Modified Capabilities

- None.

## Impact

- Affected repository areas: `openspec/changes/`, AWS GitOps desired-state files,
  deployment documentation, runbooks, and any explicit validation wrappers added
  for rendered desired state or live sync checks.
- Consumed platform contracts: `aws-iac-foundation`, `aws-eks-alb-runtime`,
  `aws-rds-postgresql`, `ecr-image-publishing`, `local-helm-packaging`, and
  `local-argocd-gitops`.
- No public API, OpenAPI, domain behavior, database schema, application runtime
  logic, local platform behavior, or default `npm run verify` behavior changes.
- No prerequisite AWS resource creation, account-backed plan/apply/destroy,
  kubeconfig generation, Argo CD admin bootstrap, or live cluster mutation is
  introduced by default local verification.
