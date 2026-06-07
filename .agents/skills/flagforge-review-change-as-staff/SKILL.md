---
name: flagforge-review-change-as-staff
description: Review a FlagForge OpenSpec change, technical design, ADR, or implementation plan from the Staff Engineer role. Use when Codex is asked to assess architecture boundaries, trade-offs, long-term fit, operability, abstraction level, or consistency with ADRs and specs.
---

# Review Change As Staff Engineer

Review a FlagForge change for architecture quality and long-term fit.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/architecture.md`
- `docs/context/delivery-workflow.md`
- `docs/agent-playbooks/staff-engineer.md`
- relevant `docs/adr/` entries
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks
- implementation diff when reviewing completed work

## Workflow

1. Check boundary fit across `src/api/`, `src/domain/`, tests, platform docs, and OpenSpec artifacts.
2. Evaluate trade-offs, operability, coupling, abstraction level, and consistency with accepted ADRs.
3. Identify missing ADRs, design updates, or OpenSpec corrections when the change introduces durable decisions.
4. Separate blocking design issues from non-blocking implementation polish.
5. Avoid broad refactor requests unless they are necessary to protect a real boundary or risk.

## Output

Lead with architecture findings ordered by severity. Always include:

## Blockers

List design or boundary issues that should block implementation, merge, or archive. Use `None` if there are no blockers.

## Suggestions

List non-blocking design improvements, artifact updates, validation additions, or follow-up decisions.

## Recommendation

Recommend one of: approve, approve with follow-ups, revise before proceeding, or stop until blockers are resolved.
