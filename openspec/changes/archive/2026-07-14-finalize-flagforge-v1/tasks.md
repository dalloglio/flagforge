## 1. Discovery

- [x] 1.1 Review `README.md`, `docs/context.md`, focused context documents, accepted ADRs, the decision log, and current roadmap/status documentation.
- [x] 1.2 Review all main OpenSpec specs and the archived Level 1 and Level 3 changes, including their completed tasks and validation boundaries.
- [x] 1.3 Review all runbooks, GitHub Actions workflows, package/Make commands, Docker/Compose assets, Helm chart, kind, local Argo CD, Kong, Prometheus/Grafana, OpenTelemetry, AWS IaC, and AWS GitOps desired state.
- [x] 1.4 Confirm no OpenSpec changes are active and inspect recent implementation history plus point-in-time GitHub issue and pull request state.
- [x] 1.5 Search for stale `future` and production-readiness language and classify each occurrence as historical, still future, implemented locally, statically validated, externally dependent, or out of scope.
- [x] 1.6 Record discovery risks, including stale MVP claims, mixed AWS evidence levels, absent issue #60 closure references, and existing `1.0.0` package/chart metadata without assuming a published release.

## 2. OpenSpec

- [x] 2.1 Create `proposal.md` with the v1 closing scope, explicit non-goals, documentation impact, and repository-external follow-ups.
- [x] 2.2 Create `design.md` with the completion definition, five evidence classifications, sources of truth, maintenance-mode rules, production-readiness guardrails, release model, and repository/external action boundary.
- [x] 2.3 Add a narrow `delivery-workflow` delta requiring a versioned current project status; do not create a new lifecycle capability or alter runtime requirements.
- [x] 2.4 Create `test-plan.md` from the FlagForge test-plan template with documentary consistency, regression, release, secret, and no-provisioning coverage.
- [x] 2.5 Run `openspec validate finalize-flagforge-v1 --strict` and resolve only change-related validation failures.

## 3. Documentation

- [x] 3.1 Update `README.md` with the completed v1 portfolio purpose, delivered product/platform capabilities, high-level architecture, OpenSpec delivery model, Level 1/Level 3 summaries, evidence distinctions, limitations, maintenance mode, validation commands, and runbook links.
- [x] 3.2 Update `docs/context/product.md` to separate original intent, delivered v1 product capabilities, delivered platform capabilities, deliberate non-goals, optional uncommitted v2 directions, and current maintenance status.
- [x] 3.3 Update `docs/context/architecture.md` with the implemented `src/domain/`, `src/application/`, `src/api/`, `src/infrastructure/postgres/`, and `src/infrastructure/telemetry/` boundaries plus accurate Helm, local platform, GitOps, AWS IaC, and observability states.
- [x] 3.4 Update `docs/context.md` so its current behavior, architecture, focused-document descriptions, and agent guardrails no longer repeat obsolete pre-persistence or pre-authentication MVP claims.
- [x] 3.5 Update `docs/context/delivery-workflow.md` to name `docs/project-status.md` as the current lifecycle/evidence source and define how maintenance changes keep it aligned.
- [x] 3.6 Update `AGENTS.md` so contributor guidance reflects implemented PostgreSQL persistence and links current lifecycle guidance without duplicating status detail.
- [x] 3.7 Create `docs/project-status.md` as the lifecycle source of truth for `FlagForge v1 - learning roadmap completed` and `Completed portfolio project - maintenance mode`.
- [x] 3.8 Document Level 1 as completed local practice and Level 3 as completed foundations/contracts in an evidence matrix that records each item's evidence class, repository evidence, last verified date or commit when available, limitations, external prerequisites, and absence of real AWS operation.
- [x] 3.9 Document v1 completion criteria, limitations, deliberate non-goals, maintenance-mode rules, and optional v2 themes without creating issues or roadmap commitments.
- [x] 3.10 Add the future `v1.0.0` checklist with mandatory host-only gates, mandatory tool-backed gates, optional local smoke checks, evidence recording, and an explicit prohibition on automatic AWS provisioning or release publication. Missing tool-backed prerequisites block release publication rather than waiving a gate.
- [x] 3.11 Review `infra/aws/README.md`, runbooks, accepted ADRs, and the decision log; correct current-state contradictions or add non-normative current-status links while preserving historical decision language and valid future prerequisites.

## 4. Consistency

- [x] 4.1 Re-run contextual searches for `future scope`, `future platform`, `future AWS`, `not current implementation`, `future kind`, `future EKS`, `future observability`, `future production target`, and related wording; review findings individually rather than replacing them mechanically.
- [x] 4.2 Verify internal links, referenced file paths, headings, and runbook links with an available link checker or deterministic repository checks.
- [x] 4.3 Compare every documented command with `package.json`, `Makefile`, Docker Compose, workflows, Helm, GitOps, and IaC entrypoints; correct documentation rather than changing functional commands in this change.
- [x] 4.4 Confirm README, `AGENTS.md`, product context, architecture context, delivery workflow context, project status, specs, ADRs, and runbooks use consistent evidence classifications and Level 1/Level 3 terminology.
- [x] 4.5 Confirm no document equates a production-oriented image, production-style exercise, static IaC contract, or desired state with a production SaaS or continuously operated AWS environment.
- [x] 4.6 Confirm package/chart `1.0.0` metadata is distinguished from a future Git tag and published GitHub release.

## 5. Verification

- [x] 5.1 Run `openspec validate finalize-flagforge-v1 --strict` and `openspec validate --all --strict`.
- [x] 5.2 Run `npm run verify` and report unrelated failures without broad cleanup.
- [x] 5.3 Run applicable documentation checks for broken links, stale future claims, release-checklist presence, maintenance-mode presence, and evidence-classification consistency.
- [x] 5.4 Inspect the final diff and confirm no changes under `src/`, `test/`, migrations, `docs/api/openapi.yaml`, dependencies, runtime workflows, Helm, GitOps, or IaC unless a separately documented correction is explicitly approved.
- [x] 5.5 Review the diff for secrets, real account IDs, tokens, credentials, kubeconfigs, personal data, customer data, sensitive generated artifacts, and production-only identifiers.
- [x] 5.6 Confirm no AWS credentials were used and no `plan`, `apply`, `destroy`, live sync, ECR publish, cloud provisioning, database mutation, or deployment occurred.

## 6. Review Gates

- [x] 6.1 Obtain PM/Product review of the v1 definition, delivered scope, non-goals, closing message, maintenance state, and optional v2 language.
- [x] 6.2 Obtain Staff Engineer review of architectural accuracy, spec/ADR consistency, evidence classification, and unsupported-claim prevention; record the initial blockers, artifact corrections, and approval with follow-ups in `reviews.md`.
- [x] 6.3 Obtain QA review of `test-plan.md`, completion criteria, commands, documentary regression checks, and the release checklist.
- [x] 6.4 Obtain SRE review of local/AWS execution distinctions, runbook coverage, operational limitations, rollback/cleanup, observability, and production-readiness wording.
- [x] 6.5 Obtain Security/LGPD review of secret absence, data claims, IAM/OIDC wording, credential boundaries, and generated-artifact handling.

## 7. Administrative Follow-Ups

- [ ] 7.1 At release time, confirm issue #60 remains closed as duplicate/completed and references PR #35 plus the archived `health-readiness-metrics` change; any GitHub comment requires a separately approved external action.
- [ ] 7.2 Reconfirm no planned issues, pull requests, or forgotten OpenSpec changes remain open; close or reclassify items only through separately approved external actions.
- [ ] 7.3 After required release checks and review gates pass, prepare and publish the `v1.0.0` tag/release through a separately approved release action; do not publish it from this documentation change.
- [x] 7.4 Decide whether to archive or close the GitHub Project and record the decision without assuming project archival is required for maintenance mode.
- [x] 7.5 Decide whether repository settings should signal maintenance mode beyond committed README/status documentation; apply settings only through a separately approved external action.
