## Context

FlagForge already has a small API, OpenSpec specs, a strict verification harness, and repository guidance in `AGENTS.md`, `docs/context.md`, and `docs/decision-log.md`. The next planned work moves into persistence and platform concerns, so the project needs durable delivery decisions before those changes begin.

This change is documentation and workflow foundation only. It must preserve the current API contract and avoid edits to `src/` and `test/`. Existing context files also need cleanup because they still describe SQLite as a future option and describe audit logs as intentionally avoided, while the consolidated direction is PostgreSQL persistence after the completed audit-log work.

## Goals / Non-Goals

**Goals:**

- Create a versioned delivery foundation that future OpenSpec changes can cite.
- Consolidate accepted platform, architecture, workflow, tooling, and review-role decisions into ADRs.
- Split durable context into focused documents under `docs/context/` while keeping a compact root context map.
- Provide reusable templates for planning, design, testing, security, operations, and post-deploy review.
- Provide agent playbooks for role-based review gates.
- Add GitHub PR and issue templates for the chosen GitHub Projects/Issues/Wiki workflow.
- Add a `Makefile` as a thin convenience wrapper over existing npm/OpenSpec commands.

**Non-Goals:**

- No API behavior changes.
- No runtime implementation changes.
- No persistence, Docker, Kubernetes, GitOps, gateway, observability, security scanning, or CI feature implementation.
- No `src/` or `test/` edits.
- No replacement of existing npm scripts.
- No detailed production runbooks for systems that do not exist yet.

## Decisions

### Keep ADRs as the durable decision source

Create `docs/adr/` and move architectural and workflow decisions there as accepted ADRs. `docs/decision-log.md` remains a chronological learning log that points readers to ADRs for durable decisions.

The required ADR set is:

- `0001-use-openspec-expanded-sdd.md`
- `0002-use-github-for-product-and-engineering-management.md`
- `0003-use-cursor-and-codex-cli-for-agentic-development.md`
- `0004-use-public-github-repository-as-portfolio.md`
- `0005-use-postgresql-for-persistence.md`
- `0006-use-level-1-local-platform-before-cloud.md`
- `0007-use-level-3-aws-platform-as-future-production-target.md`
- `0008-use-kind-for-local-kubernetes.md`
- `0009-use-helm-for-kubernetes-packaging.md`
- `0010-use-argocd-for-gitops-delivery.md`
- `0011-use-kong-as-self-hosted-api-gateway.md`
- `0012-use-opentofu-and-terragrunt-for-iac.md`
- `0013-use-opentelemetry-prometheus-and-grafana-for-observability.md`
- `0014-use-github-actions-for-ci-and-quality-gates.md`
- `0015-use-security-scanning-in-staged-adoption.md`
- `0016-use-hexagonal-architecture-and-ddd-lite.md`
- `0017-use-versioned-context-engineering-assets.md`
- `0018-use-role-based-review-gates.md`

Each ADR uses one of these statuses: `Accepted`, `Superseded`, `Deprecated`, or `Proposed`. Decisions that define future target architecture may still be `Accepted` when the ADR makes the future scope explicit.

Each ADR follows this structure:

- `Status`
- `Context`
- `Decision`
- `Rationale`
- `Consequences`
- `Alternatives considered`
- `Follow-up changes`

Alternatives considered:

- Keep all decisions in `docs/decision-log.md`: simpler, but makes it harder to distinguish historical notes from binding decisions.
- Put decisions only in OpenSpec changes: useful during a change, but archived changes are harder to scan as the everyday decision index.

### Use focused context documents

Create `docs/context/product.md`, `docs/context/domain-glossary.md`, `docs/context/delivery-workflow.md`, and `docs/context/architecture.md`. Keep `docs/context.md` as the compact map that links to these focused documents.

Alternatives considered:

- Keep one large `docs/context.md`: fewer files, but it becomes noisy as platform and delivery details grow.
- Move all context into ADRs: ADRs capture decisions, but they are not ideal for quick operating maps or glossary terms.

### Treat templates and playbooks as versioned repository assets

Create templates under `docs/templates/` and role playbooks under `docs/agent-playbooks/`. These files should be short, reusable, and explicit about expected outputs.

Alternatives considered:

- Store these as chat prompts only: fast initially, but not durable or reviewable.
- Store them in editor-specific folders only: useful for one tool, but less portable across Codex CLI, Cursor, GitHub, and public portfolio readers.

### Add GitHub workflow files without adding new automation

Add `.github/pull_request_template.md` and issue form templates for feature, bug, tech debt, and RFC intake. This aligns with the decision to use GitHub Projects, Issues, and Wiki, but does not add or modify CI workflows in this change.

Alternatives considered:

- Add GitHub Actions changes now: out of scope because this change is workflow foundation and existing CI quality behavior is already covered by `ci-quality`.
- Skip GitHub templates until later: would leave the selected management workflow undocumented in day-to-day contribution paths.

### Add a Makefile only as a command wrapper

Add `Makefile` targets that call existing commands such as `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run verify`, and OpenSpec validation. The Makefile must not become a separate source of truth for quality gates.

Alternatives considered:

- Do not add Makefile: keeps the repo smaller, but misses the consolidated decision to provide repeatable command wrappers.
- Rework npm scripts around Makefile: unnecessary churn and higher risk for no behavior gain.

## Risks / Trade-offs

- Documentation sprawl -> Keep each ADR, template, and playbook concise, with `docs/context.md` acting as the map.
- Decisions become stale -> Update ADRs, context docs, and the decision log when future changes supersede decisions.
- Makefile diverges from npm scripts -> Keep Makefile targets as thin wrappers and keep `npm run verify` as the completion gate.
- OpenSpec documentation capabilities become too procedural -> Specify observable repository artifacts and required conventions, not subjective process preferences.
- Public portfolio docs expose too much internal-like process detail -> Keep examples generic and avoid secrets, private company assumptions, or unreleased credentials.

## Migration Plan

1. Add the new docs, templates, playbooks, GitHub templates, and Makefile.
2. Update `docs/context.md`, `docs/decision-log.md`, and `AGENTS.md` to point to the new structure.
3. Remove or supersede future SQLite references in favor of PostgreSQL.
4. Validate the OpenSpec change with `openspec validate add-delivery-workflow-foundation --strict`.
5. Run full verification with `npm run verify` because the change affects OpenSpec artifacts and tooling wrappers.

Rollback is straightforward because this change does not alter runtime behavior: remove the added documentation/tooling files and restore the updated guidance files.

## Open Questions

- Should GitHub Wiki content be mirrored in `docs/` later, or should `docs/` remain the only versioned documentation source?
- Should role-based review gates become required per change type in a future OpenSpec capability, or remain advisory playbooks for now?
