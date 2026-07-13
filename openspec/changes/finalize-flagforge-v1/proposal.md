## Why

FlagForge has completed the product and platform learning roadmap planned for v1, but several durable documents still describe delivered work as future scope or use phase-specific MVP language. The repository needs one evidence-based closing pass so it can state `FlagForge v1 - learning roadmap completed` and enter `Completed portfolio project - maintenance mode` without implying that it is a production SaaS or that its AWS contracts have been executed in a live account.

## What Changes

- Consolidate `README.md` as the public entrypoint for the completed v1 portfolio project, including delivered product capabilities, high-level architecture, OpenSpec delivery model, Level 1 local platform, Level 3 AWS foundations, validation commands, limitations, maintenance status, and runbook links.
- Update `docs/context.md`, `docs/context/product.md`, `docs/context/architecture.md`, and `docs/context/delivery-workflow.md` so current product scope, runtime boundaries, telemetry, local platform, GitOps, AWS IaC, and documentation ownership accurately reflect the archived implementation history.
- Update `AGENTS.md` so repository guidance no longer treats PostgreSQL persistence as a future target and directs contributors to the current project-status source.
- Add `docs/project-status.md` as the current source of truth for roadmap state, v1 completion criteria, an evidence matrix with validation provenance and limitations, maintenance mode, administrative follow-ups, and the future `v1.0.0` release checklist.
- Classify claims consistently as: implemented and exercised locally; represented and validated statically; prepared but blocked on external account/configuration; deliberately out of scope; or optional v2 direction with no delivery commitment.
- Mark Level 1 as completed local practice and Level 3 as completed foundations/contracts, while stating explicitly that no continuously operated AWS environment or production service has been proven.
- Reconcile stale uses of `future` contextually rather than mechanically, preserving valid future prerequisites and historical decision records.
- Define documentary v1 completion and release criteria, including planned issue/PR closure, archived OpenSpec changes, valid main specs, green CI, consolidated documentation, no committed secrets, runbook coverage, and documented limits.
- Record repository-external administrative follow-ups without performing them automatically: verify issue/PR/project state, confirm issue #60 has references to PR #35 and the archived `health-readiness-metrics` change, prepare but do not publish `v1.0.0`, and decide whether to archive the GitHub Project or apply repository maintenance settings.
- Require PM/Product, Staff Engineer, QA, SRE, and Security/LGPD review gates for the final documentation claims.
- Do not add features or change application runtime, API/OpenAPI, domain behavior, persistence, migrations, infrastructure provisioning, dependencies, deployment, ECR activation, or live GitOps sync.

## Capabilities

### New Capabilities

None. Project lifecycle status and portfolio documentation do not introduce a public or runtime capability.

### Modified Capabilities

- `delivery-workflow`: Add a durable documentation-governance requirement for a versioned current project status that records lifecycle state, classifies implementation evidence, distinguishes portfolio completion from production readiness, and stays aligned when future maintenance or roadmap decisions change.

No new capability is required. The narrow delta uses the existing documentation-governance boundary and does not alter API behavior, runtime behavior, persistence, or deployment behavior.

## Impact

- Documentation planned for implementation: `README.md`, `AGENTS.md`, `docs/context.md`, `docs/context/product.md`, `docs/context/architecture.md`, `docs/context/delivery-workflow.md`, and new `docs/project-status.md`.
- Documentation reviewed for consistency: accepted ADRs, current OpenSpec specs, archived Level 1 and Level 3 changes, runbooks, GitHub Actions workflows, Helm, local platform assets, AWS IaC, and AWS GitOps desired state.
- Repository-external follow-ups: GitHub issue, pull request, project, release, and maintenance-setting checks. They remain explicit human actions and are not performed by this change.
- Runtime and contract impact: none. `src/`, `test/`, database migrations, `docs/api/openapi.yaml`, package dependencies, and provisioned infrastructure remain unchanged.
