# Pre-Implementation Review Gates

Date: 2026-07-13

Scope reviewed:

- `proposal.md`
- `design.md`
- `specs/delivery-workflow/spec.md`
- `tasks.md`
- `test-plan.md`
- Current delivery workflow context, Staff Engineer playbook, accepted ADR boundaries, and relevant Level 1/Level 3 evidence

## Staff Engineer Review

Initial decision: revise before proceeding.

Initial blockers:

1. The planned documentation surface omitted `AGENTS.md` and `docs/context/delivery-workflow.md`, which would leave durable contributor guidance and source-of-truth ownership inconsistent with the final project status.
2. The release policy called tool-backed checks required while also permitting them to be skipped with residual-risk acceptance, leaving the `v1.0.0` publication gate ambiguous.

Resolution:

- `proposal.md`, `design.md`, `tasks.md`, `test-plan.md`, and the `delivery-workflow` delta now include `AGENTS.md` and `docs/context/delivery-workflow.md` wherever current lifecycle ownership and documentation consistency apply.
- The project-status design now requires an evidence matrix with evidence class, repository evidence, last verified date or commit when available, prerequisites, and limitations.
- The release policy now separates mandatory host-only gates from mandatory tool-backed gates. A missing tool or service blocks release publication until the gate succeeds in a capable environment; only optional local smoke checks may be skipped with a recorded reason.
- Accepted ADRs and the decision log remain historical records. Any current-status annotation must be non-normative and link to `docs/project-status.md` without rewriting the accepted decision.

Re-review decision: approve with follow-ups.

Blockers: None.

Findings:

- The documentation-only scope respects runtime, API, persistence, deployment, and infrastructure boundaries.
- The five evidence classifications prevent local execution, static contract validation, externally dependent integration, deliberate non-goals, and optional v2 directions from being conflated.
- `docs/project-status.md` has a defined ownership boundary, while README, context, and agent guidance remain summaries or contributor guardrails rather than competing status sources.
- The release policy now distinguishes verification of this documentation change from the stronger mandatory gates required before external `v1.0.0` publication.
- The narrow `delivery-workflow` delta represents a durable governance requirement without creating an artificial lifecycle capability.

Follow-ups:

- During implementation, keep evidence claims tied to repository paths, archived changes, commands, dates, or commits and state limitations next to each Level 1/Level 3 item.
- Preserve historical ADR and decision-log language; add only non-normative current-status links where a reader could otherwise mistake history for current state.
- Re-run Staff review after the documentation implementation if the final diff expands beyond the files or governance boundaries declared by this change.

## Recommendation

Approve with follow-ups.
