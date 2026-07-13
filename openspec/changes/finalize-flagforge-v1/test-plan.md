# Test Plan: finalize-flagforge-v1

## Scope

This plan validates the documentation and governance changes used to close the FlagForge v1 learning roadmap and declare `Completed portfolio project - maintenance mode`.

The primary risks are inaccurate status claims, contradictions between durable documents, stale future-scope language, broken commands or links, and confusion between:

- behavior implemented and exercised locally;
- infrastructure contracts or desired state validated statically;
- integrations prepared but dependent on external accounts, credentials, configuration, secrets, or live resources;
- deliberately out-of-scope functionality;
- optional v2 directions with no delivery commitment;
- portfolio completion and production SaaS readiness.

The plan also verifies the added `delivery-workflow` requirement for a versioned current project status. It does not introduce new runtime, API, OpenAPI, domain, persistence, migration, deployment, or infrastructure behavior. Existing automated tests remain regression evidence rather than new feature coverage.

## Test levels

### Unit tests

No new unit tests are required because the change adds no executable logic. Run the existing unit suite to prove documentation work did not change application behavior:

```bash
npm test
```

Expected result: the existing API, domain, authentication, rate-limit, operational endpoint, metrics, telemetry, and evaluation tests remain green with no test changes required by this change.

### Integration tests

No new integration fixture or database behavior is introduced. PostgreSQL integration tests are not required to verify this documentation-only change, but they are a mandatory release-readiness regression gate that must run against an isolated test database before `v1.0.0` publication:

```bash
npm run test:postgres
```

Expected result: the existing persistence, migration, flag, evaluation, and audit-log behavior remains unchanged. The command requires explicit `TEST_DATABASE_URL` and must never fall back to `DATABASE_URL`.

### API tests

No endpoint, status code, payload, validation rule, authentication rule, or OpenAPI operation changes. The existing Supertest suite and OpenAPI validation provide negative regression evidence. Confirm the implementation diff does not modify `src/api/`, API tests, or `docs/api/openapi.yaml`.

### Contract tests

- Validate the change-specific `delivery-workflow` delta in strict mode.
- Validate all main specs and changes in strict mode.
- Confirm the delta adds only current-status documentation governance and does not modify runtime or platform behavior requirements.
- Confirm `docs/project-status.md`, README, and context summaries satisfy the delta scenarios for lifecycle state, evidence classes, unsupported production claims, and external action boundaries.

### End-to-end and platform checks

No live end-to-end environment is required for the documentation change. Optional local smoke checks may be recorded as release evidence when Docker, Compose, PostgreSQL, Helm, kind, kubectl, Argo CD, Kong, Prometheus, and Grafana are available. A skipped optional check must name the unavailable prerequisite and must not be reported as passed.

No AWS end-to-end check is expected. Do not run account-backed plans, applies, destroys, ECR publishing, kubeconfig generation, live Argo CD sync, or cloud provisioning to validate this change.

### Manual documentation review

- PM/Product reviews scope, v1 completion, non-goals, maintenance message, and optional v2 language.
- Staff Engineer reviews technical accuracy, architecture boundaries, spec/ADR consistency, and evidence classification.
- QA reviews this plan, release commands, completion criteria, failure cases, and residual risk.
- SRE reviews runbook links, operational limits, rollback/cleanup language, observability claims, and local/AWS distinctions.
- Security/LGPD reviews secrets, account/identity claims, generated artifacts, data minimization, and the absence of real credentials or personal/customer data.

## Cases

### Happy paths

- README identifies FlagForge as a completed v1 learning/portfolio project in maintenance mode and links the detailed project status.
- Product context separates original intent, delivered product scope, delivered platform scope, deliberate non-goals, optional v2 directions, and current lifecycle status.
- Architecture context describes the actual runtime boundaries, including `src/infrastructure/telemetry/`, without moving platform concerns into domain or application layers.
- Delivery workflow context assigns current lifecycle/evidence ownership to `docs/project-status.md`, and `AGENTS.md` no longer treats implemented PostgreSQL persistence as future work.
- Project status marks Docker/Compose, PostgreSQL, Helm, kind, local Argo CD, Kong, Prometheus/Grafana, OpenTelemetry, health, readiness, and metrics as completed at their evidenced local scope.
- Project status marks OpenTofu/Terragrunt, RDS, EKS/ALB, ECR workflow shape, AWS GitOps desired state, runbooks, and guardrails as completed foundations/contracts with the correct evidence class.
- ECR publishing is described as guarded and disabled until external prerequisites are configured.
- AWS live sync, real RDS/EKS/ALB/ECR resources, and a continuously operated cloud environment are explicitly not claimed.
- The `v1.0.0` checklist contains all required commands and separates mandatory host-only gates, mandatory tool-backed gates, optional local smoke checks, and release publication.
- Main OpenSpec specs remain valid and no completed capability is left incorrectly categorized as future current scope.
- All applicable review gates record approval, requested corrections, or residual risk before implementation is considered complete.

### Edge cases

- Historical ADR or decision-log text says a capability was future at decision time: preserve history and add current-status context or links instead of rewriting the decision as if it had always been implemented.
- A runbook says networking, IAM/OIDC, remote state, production secrets, DNS/TLS, alerting, or live AWS operation is future: keep the statement because the prerequisite remains unimplemented.
- A document uses "production Docker image" or "production-style GitOps": clarify that the phrase describes a pattern or build target, not production service readiness.
- `package.json` and Helm `appVersion` contain `1.0.0`: do not infer that a Git tag or GitHub release exists; require external release evidence.
- A mandatory release command depends on an unavailable CLI or service: record the prerequisite as a release blocker and run the command in a capable environment before publication; do not add credentials or report the gate as passed.
- A possible v2 subject is mentioned: label it optional and uncommitted, with no issue, date, owner, or delivery promise created by this change.
- GitHub issue/PR/project state changes after documentation review: treat status as point-in-time evidence and recheck at release time.
- Issue #60 is closed without implementation references: classify it as duplicate/completed and require a separately approved GitHub follow-up to link PR #35 and the archived change.

### Expected failures

- Strict OpenSpec validation fails if the `delivery-workflow` delta is malformed or lacks valid scenarios.
- Documentation review fails if README, `AGENTS.md`, product context, architecture context, delivery workflow context, and project status disagree about lifecycle state or evidence level.
- Documentation review fails if completed Level 1 capabilities remain under current `Future scope` without historical context.
- Documentation review fails if RDS/EKS/ALB contracts or AWS GitOps desired state are described as live account execution.
- Documentation review fails if the project is called production-ready, commercial SaaS-ready, covered by SLA/SLO, multi-region, disaster-recovery validated, or continuously operated in AWS without evidence.
- Documentation review fails if multi-tenancy, SDKs, full RBAC, flag environments, segment management, distributed rate limiting, production secret rotation, production alerting, 24x7 support, or live AWS operation are implied as v1 capabilities.
- Release-readiness review fails if mandatory commands are absent, commands do not match repository entrypoints, or external-tool checks are silently marked passed.
- Security/LGPD review fails if the diff contains real account IDs, credentials, tokens, kubeconfigs, secret values, personal data, customer data, state/plan files, or sensitive generated artifacts.
- Scope review fails if the diff changes `src/`, `test/`, migrations, OpenAPI, dependencies, functional workflows, Helm, GitOps, or IaC without explicit approval and a justified scope change.
- No-provisioning review fails if validation performs AWS account access, `plan`, `apply`, `destroy`, live sync, ECR push, or resource mutation.

## Data

No test data, runtime fixtures, migrations, or database reset changes are required.

Review inputs are:

- `README.md`, `AGENTS.md`, `docs/context.md`, `docs/context/*.md`, and `docs/project-status.md`;
- accepted ADRs and `docs/decision-log.md`;
- all current OpenSpec specs and relevant archived Level 1/Level 3 changes;
- runbooks, workflows, package/Make commands, Docker/Compose, Helm, kind, Argo CD, Kong, observability, AWS IaC, and AWS GitOps files;
- implementation diff and Git history;
- point-in-time GitHub issue, pull request, project, Actions, tag, and release evidence when available.

Allowed examples remain obvious non-sensitive placeholders such as `dev`, `us-east-1`, `aws-account-id`, `000000000000`, `example.invalid`, and local development credentials already documented as non-secret.

Disallowed data includes real AWS account IDs, access keys, tokens, kubeconfigs, Argo CD credentials, live secret values, personal profile names, SSO URLs, personal/customer data, production-only identifiers, `.tfstate`, plan files, provider caches, and copied cloud outputs.

## Automation

### Required change and repository gates

```bash
openspec validate finalize-flagforge-v1 --strict
openspec validate --all --strict
npm run typecheck
npm test
npm run verify
```

Expected result: all commands exit successfully. `npm run verify` remains the canonical host-only completion gate and includes typecheck, lint, formatting, unit tests, OpenAPI validation, and strict OpenSpec validation.

### Documentary checks

Use contextual searches as review inputs, not mechanical replacement commands:

```bash
rg -n -i "future scope|future platform|future AWS|not current implementation|future kind|future EKS|future observability|future production target" README.md docs infra/aws/README.md
rg -n -i "production-ready|production readiness|maintenance mode|learning roadmap completed|Completed portfolio project" README.md docs
rg -n "npm ci|npm run verify|npm run test:postgres|npm run build|docker build -t flagforge-api:v1.0.0|helm lint charts/flagforge-api|make iac-aws-fmt-check|make iac-aws-validate|npm run gitops:aws:validate|openspec validate --all --strict" README.md docs/project-status.md
git diff --check
git diff --name-only
```

Review each match against specs, archives, implementation, and evidence class. Expected result: no current-state contradiction, unsupported production claim, missing release command, whitespace error, or out-of-scope functional file.

For internal links, run an installed Markdown link checker such as `lychee` when available. If no checker is installed, validate repository-relative links and paths with deterministic searches and manual review, and record the automation gap.

### Future `v1.0.0` release gates

The release checklist must contain and classify every command below as mandatory before publication.

Host-only gates:

```bash
npm ci
npm run verify
npm run build
openspec validate --all --strict
```

Tool-backed gates:

```bash
npm run test:postgres
docker build -t flagforge-api:v1.0.0 .
helm lint charts/flagforge-api
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
make iac-aws-fmt-check
make iac-aws-validate
npm run gitops:aws:validate
```

PostgreSQL, Docker, Helm, OpenTofu, Terragrunt, and provider/plugin downloads are documented prerequisites for the tool-backed gates. If a prerequisite is unavailable, the release is blocked until the gate succeeds in a capable environment. There is no implicit exception or waiver in this change.

### Optional local smoke checks

When prerequisites exist, record evidence for Docker Compose, Kong, Prometheus, Grafana, kind, Helm deployment, local Argo CD sync, `/healthz`, `/readyz`, and `/metrics`. Use the canonical runbooks and Make targets rather than duplicating procedures in this plan.

These checks are optional for the documentation change and must not be used to claim AWS or production readiness.

### Diff and sensitive-data gates

- Confirm no functional change by reviewing the file list and diffs for `src/`, `test/`, migrations, `docs/api/openapi.yaml`, `package.json`, `package-lock.json`, workflows, Helm, GitOps, and IaC.
- Search added lines for credential and sensitive-artifact patterns, then perform manual Security/LGPD review because deterministic searches cannot prove absence of all secret formats.
- Confirm no generated build, state, plan, rendered cloud output, kubeconfig, or local environment file is added.
- Confirm validation logs show no AWS credential use, provisioning, publishing, or live sync.

## Residual risk

- A repository-local documentation review cannot prove that every historical local smoke workflow was rerun for the release; archived tasks and current optional smoke evidence have different strength.
- Static IaC validation does not prove provider permissions, AWS quotas, network routing, IAM/OIDC trust, RDS/EKS/ALB behavior, ECR publishing, cluster access, or live GitOps reconciliation.
- Point-in-time GitHub issue, pull request, project, CI, tag, release, environment, and repository-setting state can change after validation.
- A missing Markdown link checker leaves some link validation manual.
- Deterministic secret searches can miss unknown secret formats or context-dependent LGPD data; manual Security/LGPD review remains required.
- Maintenance mode and optional v2 language can drift if future changes do not update `docs/project-status.md` and its README/context summaries as required by the delta.

## Blockers

None for creation and verification of the documentation change. Missing tools or services may limit optional smoke evidence, but missing prerequisites for a mandatory `v1.0.0` gate block release publication until that gate succeeds elsewhere.

## Suggestions

- Record exact commands, dates, commit SHA, and prerequisite versions for mandatory `v1.0.0` release evidence; record skipped prerequisites only for optional smoke checks.
- Add a Markdown link checker to a future maintenance change only if the dependency and CI cost are justified; do not expand this documentation-only change solely for tooling.
- Use a short release note assembled from archived roadmap milestones so the GitHub release does not become a second, divergent project-status source.
- Re-run GitHub issue/PR/project checks immediately before publication because current discovery is only point-in-time evidence.

## Recommendation

Proceed with plan.
