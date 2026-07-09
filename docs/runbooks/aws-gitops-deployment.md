# AWS GitOps Deployment Runbook

## Service

FlagForge API GitOps desired state for the Level 3 AWS `dev` learning target.

## Purpose

This runbook documents how the AWS `dev` Argo CD target consumes the existing
Helm chart, EKS/ALB runtime contract, RDS PostgreSQL handoff, and ECR image
publishing contract. It does not provision AWS resources, bootstrap Argo CD,
generate kubeconfigs, mutate live clusters, change application behavior, or
claim readiness for real customer traffic.

## Target

- Environment: `dev`.
- Region: `us-east-1`.
- Desired-state path: `infra/aws/gitops/dev/us-east-1/`.
- Argo CD Application: `flagforge-api-aws-dev`.
- Helm chart: `charts/flagforge-api`.
- Helm values: `infra/aws/gitops/dev/us-east-1/values-aws-dev.yaml`.
- Namespace: `flagforge`.
- First sync mode: manual. Automated sync is deferred until environment
  protection, access, rollback, and live operations are reviewed.

## Prerequisites and Handoffs

The AWS GitOps target consumes existing platform contracts:

- EKS and ALB: cluster access for `flagforge-dev`, namespace `flagforge`,
  ingress class `alb`, exposure mode `internet-facing` for `dev`, HTTP listener
  port `80`, `/readyz` health checks, AWS Load Balancer Controller ownership,
  OIDC assumptions, network reachability, and the future ALB endpoint.
- RDS PostgreSQL: endpoint, port `5432`, database name, application username
  reference, password reference, TLS expectation, and existing SQL migrations
  through `npm run db:migrate`.
- ECR: image URI shape
  `aws-account-id.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:yyyymmdd.short-sha`
  in committed placeholders, with real reviewed commit-addressable tags supplied
  before live sync.
- Helm: chart-owned Deployment, Service, ConfigMap, optional Ingress, probes,
  and secret references.
- Argo CD: repository access to this repo, Application reconciliation, manual
  sync ownership, diff inspection, and health reporting.

This target does not redefine EKS, ALB, networking, IAM/OIDC, DNS, TLS, RDS,
ECR, migration, or production edge contracts.

## Promotion

1. Publish and review a FlagForge API image using the ECR image publishing
   workflow.
2. Select a specific commit-addressable tag such as `20260708.a1b2c3d`. Do not
   promote `latest` as the only deployable reference.
3. Open a pull request that updates
   `infra/aws/gitops/dev/us-east-1/values-aws-dev.yaml`.
4. Run credential-free pull request validation:

   ```bash
   npm run gitops:aws:validate
   npm run verify
   ```

5. Confirm Staff, SRE, Security/LGPD, and QA review expectations for the
   deployment change are satisfied.
6. Merge the desired-state change to the source-of-truth branch.
7. Use the reviewed manual approval or environment protection path before an
   operator syncs the Argo CD Application.

Promotion-only changes must not change public API behavior, OpenAPI, domain
behavior, database schema, migrations, image publishing tag strategy, or local
platform behavior unless a separate OpenSpec change explicitly does so.

## Configuration and Secrets

Committed desired state may include non-sensitive runtime configuration,
placeholder account values, and external secret references. It must not include
real AWS account IDs, credentials, kubeconfigs, Argo CD credentials, cloud
tokens, copied cloud outputs, personal data, customer data, production-only
identifiers, or live secret values.

The AWS `dev` values intentionally start with placeholder image values such as
`aws-account-id.dkr.ecr.us-east-1.amazonaws.com/flagforge-api` and
`yyyymmdd.short-sha`. Replace them with reviewed account-backed ECR repository
and image tag values before any real sync. Do not commit the real AWS account ID
or a production-only tag unless a separate reviewed architecture decision or
promotion change explicitly allows it.

AWS `dev` also starts with `replicaCount: 1` because the current administrative
rate limiter is in memory per application process. Use `replicaCount > 1` only
after shared rate limiting, gateway-level rate limiting, or another explicit
architecture decision addresses the effective limit across pods. This PR does
not change application runtime behavior.

The AWS values reference an existing Kubernetes Secret named
`flagforge-api-runtime`. That Secret, or an equivalent external secret
integration managed by Argo CD, must provide:

- `DATABASE_URL`
- `ADMIN_API_KEY`

Production secret management, secret rotation, database user provisioning, and
external secret controller ownership remain separate reviewed concerns.

## Credential-Free Validation

Run static desired-state validation without AWS, EKS, kubeconfig, Argo CD,
Docker, ECR, RDS, ALB, remote state, or cloud-resource access:

```bash
npm run gitops:aws:validate
```

The command lints the Helm chart with the AWS values and renders the chart to
`/tmp/flagforge-aws-gitops-rendered.yaml` for local inspection. It is separate
from `npm run verify`; default repository verification remains host-only and
does not perform live cloud or cluster checks.

## Live Sync Validation

When account-backed EKS and Argo CD access are available, validate a manual sync
with explicit live commands:

```bash
argocd app get flagforge-api-aws-dev
argocd app diff flagforge-api-aws-dev
argocd app sync flagforge-api-aws-dev
argocd app wait flagforge-api-aws-dev --health --sync --timeout 300
kubectl -n flagforge rollout status deployment/flagforge-api --timeout=300s
kubectl -n flagforge get ingress flagforge-api
curl -fsS -H "Host: flagforge-dev.example.invalid" http://<alb-dns-name>/healthz
curl -fsS -H "Host: flagforge-dev.example.invalid" http://<alb-dns-name>/readyz
```

These checks are intentionally outside `npm run verify`. Product-level ingress
validation confirms the API is reachable through the ALB path without changing
public API semantics. The Host header must match the host configured on the
Ingress while DNS is still a placeholder. After the Ingress host is updated to a
real DNS name that points at the ALB, the operator may test directly with that
configured hostname, for example
`curl -fsS http://<configured-ingress-host>/healthz`.

## Drift Inspection

Use source-controlled desired state as the source of truth:

```bash
argocd app diff flagforge-api-aws-dev
argocd app get flagforge-api-aws-dev
kubectl -n flagforge diff -f /tmp/flagforge-aws-gitops-rendered.yaml
```

Investigate differences between the merged desired-state revision, Argo CD sync
status, and live Kubernetes resources before applying manual live changes.

## Rollback

Rollback is a desired-state change:

1. Identify a prior known-good image tag or configuration revision.
2. Revert or update `values-aws-dev.yaml` in a reviewed pull request.
3. Merge the rollback desired state.
4. Manually sync and validate Argo CD health, Kubernetes rollout, and
   `/healthz` or `/readyz` through the ALB path.

Rollback must not depend on mutable-only image tags. GitOps rollback is separate
from infrastructure cleanup, database rollback, migration rollback, code
rollback, ECR cleanup, and RDS data recovery.

## Cleanup

To remove or disable the GitOps target, delete or suspend the Argo CD
Application through a reviewed desired-state change and then sync the change
with the live Argo CD instance. This does not destroy AWS resources, delete RDS
data, remove ECR images, clean remote state, or revoke cluster access.

## Failure Ownership

- Failed Argo CD sync or rejected Argo CD access: platform operator with SRE
  escalation.
- Unhealthy Argo CD application status: SRE owner with Staff review if chart or
  dependency contracts are unclear.
- Failed Kubernetes rollout: service owner and SRE.
- Unavailable ALB ingress: SRE and platform owner for ALB/controller/network
  handoffs.
- Missing image: image publishing owner.
- Missing database Secret or failed database connectivity: platform owner and
  database handoff owner.
- Suspicious secret, credential, account metadata, log, or generated artifact
  exposure: Security/LGPD escalation before further sync attempts.

## Review Gates

Before implementation is considered ready:

- Staff review covers architecture boundaries, dependency handoffs, and
  alignment with accepted AWS, Helm, Argo CD, and CI decisions.
- SRE review covers sync reliability, health checks, drift, rollback, cleanup,
  observability assumptions, and runbook coverage.
- Security/LGPD review covers secrets, access, repository contents, image
  references, logs, generated artifacts, and metadata exposure.
- QA review covers desired-state validation, promotion, deployment health,
  rollback, and regression boundaries.
