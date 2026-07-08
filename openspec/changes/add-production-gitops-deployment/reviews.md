# Pre-Implementation Review Gates

Date: 2026-07-08

Scope reviewed:

- `proposal.md`
- `design.md`
- `specs/production-gitops-deployment/spec.md`
- `tasks.md`
- Related ADRs and platform specs for AWS, Helm, Argo CD, ECR, RDS, EKS/ALB, CI, and role-based review gates

## Staff Engineer Review

Decision: approve with follow-ups.

Blockers: None.

Findings:

- The change fits the accepted platform direction by keeping AWS GitOps desired state under `infra/`, outside `src/`, and separate from local Argo CD practice.
- The design correctly consumes existing Helm, ECR, EKS/ALB, RDS, Argo CD, and CI contracts instead of redefining those foundations.
- Manual first sync is an appropriate early Level 3 trade-off because account-backed access, environment protection, and live operations are not mature enough for auto-sync.

Follow-ups:

- Keep the implementation limited to desired state, documentation, and credential-free validation unless a later OpenSpec change expands scope.
- Resolve the exact promotion source-of-truth details during implementation: Argo CD target revision, branch or commit reference, and any GitHub environment protection wording.
- Treat auto-sync, production secret management, and progressive delivery as future reviewed decisions.

## SRE Review

Decision: approve with follow-ups.

Blockers: None.

Findings:

- The design separates static/render validation from live sync validation, which protects default local verification from cloud and cluster dependencies.
- Live validation expectations include Argo CD sync, Argo CD health, Kubernetes rollout, and FlagForge `/healthz` or `/readyz`, which avoids relying on sync status alone.
- Rollback and cleanup are correctly scoped to desired-state rollback and Argo CD application cleanup, without implying that code rollback destroys AWS resources or preserves database state.

Follow-ups:

- Implement a focused deployment runbook or equivalent operations document that lists sync, health inspection, drift inspection, rollback, cleanup, and escalation commands.
- Make failure ownership explicit for missing images, missing secrets, failed RDS connectivity, rejected Argo CD access, failed rollouts, and unavailable ALB ingress.
- Keep live validation commands separate from `npm run verify` and label all account-backed commands as optional, explicit workflows.

## Security/LGPD Review

Decision: approve with follow-ups.

Blockers: None.

Findings:

- The change explicitly forbids committing real account IDs, credentials, kubeconfigs, Argo CD credentials, cloud tokens, copied outputs, personal data, customer data, production-only identifiers, and live secret values.
- Sensitive runtime settings are required to use existing Kubernetes Secret, Argo CD, or external secret integration references instead of plaintext desired state.
- The change preserves application behavior and does not introduce new request data, personal data processing, or public API exposure.

Follow-ups:

- Prefer a narrow first implementation using the Helm chart's existing Secret reference support, with exact secret name/key expectations documented.
- Keep external secret management, Argo CD credential bootstrap, IAM/OIDC authorization, and production access controls as separate reviewed changes unless explicitly narrowed here.
- Include rendered manifests, examples, logs, screenshots, and validation outputs in the secret-leak review scope before completion.

## QA Review

Decision: approve with follow-ups.

Blockers: None.

Findings:

- The OpenSpec scenarios cover desired-state placement, contract consumption, safe configuration, promotion, validation boundaries, operations, and required role gates.
- The change correctly states that public API behavior, OpenAPI, domain behavior, migrations, local platform behavior, and image tag strategy remain unchanged.
- Validation scope is testable through credential-free checks for YAML syntax, Helm rendering, OpenSpec alignment, and repository quality, plus documented live checks when account-backed access exists.

Follow-ups:

- Add or document focused checks that prove the AWS values render with the existing Helm chart and do not render chart-managed plaintext secrets for production-style values.
- Include negative review cases for mutable-only image tags, accidental raw workload manifests, committed secret values, and live/cloud checks creeping into `npm run verify`.
- Before completion, run focused validation plus `npm run verify` and strict OpenSpec validation, then record any skipped live checks with the prerequisite that made them unavailable.
