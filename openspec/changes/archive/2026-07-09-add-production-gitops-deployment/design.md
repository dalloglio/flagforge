## Context

Issue #29 and the PRD request a production-style GitOps deployment path for the
Level 3 AWS `dev` target. The repository already has AWS IaC contracts for RDS
PostgreSQL, EKS, and ALB, an ECR image publishing contract, a Helm chart for the
FlagForge API, and a local Argo CD desired-state pattern.

This change is a deployment-consumer increment. It must connect those handoffs
without creating prerequisite AWS resources, changing application feature
behavior, or making local verification depend on AWS, EKS, Argo CD, Docker, or
cloud credentials.

## Goals / Non-Goals

**Goals:**

- Represent AWS `dev` GitOps desired state in a source-controlled path that is
  clearly separate from local Argo CD practice.
- Use the existing Helm chart and ECR image contract as the deployment source.
- Document promotion, validation, sync health, product-level ingress checks,
  rollback, drift inspection, cleanup, and operational ownership.
- Keep committed examples secret-free and account-neutral.
- Keep `npm run verify` host-only while providing separate optional platform and
  live validation commands.

**Non-Goals:**

- Provisioning EKS, ALB, RDS, ECR, IAM/OIDC, networking, remote state, DNS, TLS,
  observability, or Argo CD itself.
- Adding account-backed `plan`, `apply`, `destroy`, import, state mutation,
  kubeconfig generation, or Argo CD admin bootstrap to default workflows.
- Changing the public API, OpenAPI contract, domain behavior, database schema,
  migrations, local platform behavior, or image publishing tag strategy.
- Claiming production readiness for real customer traffic.

## Decisions

1. Store AWS GitOps desired state under `infra/aws/gitops/dev/us-east-1/`.

   This keeps the deployment target close to the existing AWS live composition
   while separating it from `infra/argocd/`, which remains local-only. The path
   encodes environment and region and avoids embedding platform deployment
   concerns in `src/`.

   Alternative considered: extend `infra/argocd/` with AWS files. That would
   blur local Level 1 practice and Level 3 AWS desired state.

2. Use Argo CD Application plus Helm values rather than hand-written workload
   manifests.

   The AWS Application should point to `charts/flagforge-api` and use an
   AWS-specific values file from the AWS GitOps path. The values file is where
   image repository, image tag placeholder, ingress, replica, and existing
   Secret references are represented.

   Alternative considered: raw Kubernetes Deployment and Service manifests.
   That would duplicate chart behavior and bypass ADR 0009.

3. Use reviewed, commit-addressable ECR image tags for promotion.

   Desired state should carry a specific deployable tag such as
   `<yyyymmdd>.<short-sha>` and the documented placeholder image URI shape
   `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:<tag>`.
   Promotion is a pull request that updates desired state after image publishing
   and review gates complete.

   Alternative considered: `latest` or another mutable tag. That would make
   rollback and review provenance ambiguous.

4. Make the first AWS GitOps sync manual.

   The initial target should document manual sync or a disabled auto-sync
   posture until account-backed Argo CD access, environment protection, and live
   operations are reviewed. A future change can enable automated sync after the
   team has evidence from the first Level 3 deployment path.

   Alternative considered: auto-sync after merge. That is useful later, but it
   couples repository merge to live cluster mutation before the prerequisite
   access and operations controls are mature.

5. Represent secrets as external Kubernetes or Argo CD references.

   The desired state should reference an existing Kubernetes Secret or equivalent
   external secret integration point for `DATABASE_URL` and `ADMIN_API_KEY`.
   It must not commit secret values, kubeconfigs, cloud tokens, Argo CD
   credentials, real account IDs, copied outputs, or personal data.

   Alternative considered: chart-managed Secret values in source control. That
   is acceptable for local development only and is not the production-style AWS
   secret posture.

6. Split validation into static, render, and live classes.

   Pull request validation should cover OpenSpec, repository quality, YAML
   syntax, and Helm rendering without cloud access. Live sync, Argo CD health,
   Kubernetes rollout, ingress reachability, and FlagForge health endpoint checks
   should be explicit documented commands that are safe to skip in default local
   verification.

   Alternative considered: include live AWS or Argo CD checks in
   `npm run verify`. That would make ordinary development depend on external
   infrastructure.

## Risks / Trade-offs

- Desired state can drift from the Helm chart values model -> require the AWS
  Application to consume the chart and AWS values file instead of raw workload
  manifests.
- Promotion can be ambiguous -> document the reviewed image tag, pull request,
  merge, and manual sync sequence.
- Secret handling can become unsafe -> use external secret references and keep
  production secret management as a separate reviewed concern.
- Argo CD sync status can give false confidence -> require Kubernetes rollout
  and FlagForge `/healthz` or `/readyz` checks in live validation.
- Rollback expectations can be misleading -> distinguish GitOps desired-state
  rollback from infrastructure cleanup, database rollback, and code rollback.
- AWS examples can leak sensitive metadata -> use placeholders and forbid real
  account IDs, copied cloud outputs, kubeconfigs, tokens, credentials, personal
  data, customer data, and production-only identifiers.
- Manual sync slows promotion -> accept the friction for the first target until
  live access, environment protection, and operations practices are reviewed.
