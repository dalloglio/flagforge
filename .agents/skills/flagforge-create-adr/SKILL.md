---
name: flagforge-create-adr
description: Create or update a FlagForge Architecture Decision Record using the ADR template and accepted decision history. Use when Codex is asked to document a durable architecture, platform, tooling, workflow, or delivery decision in docs/adr/.
---

# Create FlagForge ADR

Create or update an ADR for a durable accepted decision.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/architecture.md`
- `docs/context/delivery-workflow.md`
- `docs/templates/adr.md`
- `docs/adr/`
- `docs/decision-log.md`
- active `openspec/changes/<change-id>/` artifacts when the decision comes from a change

## Workflow

1. Confirm the decision is durable enough for an ADR; use `docs/decision-log.md` for chronological notes that are not durable.
2. Use `docs/templates/adr.md` and the next appropriate ADR number.
3. Capture context, decision, rationale, consequences, alternatives, and follow-up changes.
4. Align with existing ADRs and call out conflicts explicitly.
5. Keep the ADR focused on one decision; split unrelated decisions when needed.

## Output

When editing files, summarize the ADR path and decision. Always include:

## Blockers

List missing decision inputs, unresolved alternatives, or conflicts with existing ADRs. Use `None` if there are no blockers.

## Suggestions

List non-blocking improvements, related context updates, or follow-up OpenSpec changes.

## Recommendation

Recommend one of: accept, revise before accepting, defer, or stop until blockers are resolved.
