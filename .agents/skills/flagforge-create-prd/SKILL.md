---
name: flagforge-create-prd
description: Create or update a FlagForge product requirements document using the repository PRD template, product context, OpenSpec change artifacts, and delivery workflow. Use when Codex is asked to draft a PRD, clarify product requirements, define acceptance criteria, or turn a feature idea into a FlagForge PRD.
---

# Create FlagForge PRD

Create or update a PRD for FlagForge planning work.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/product.md`
- `docs/context/domain-glossary.md`
- `docs/context/delivery-workflow.md`
- `docs/templates/prd.md`
- active `openspec/changes/<change-id>/` artifacts when a change id is provided or discoverable

## Workflow

1. Identify the product problem, affected users, goals, non-goals, and acceptance criteria.
2. Use `docs/templates/prd.md` as the artifact structure.
3. Align the PRD with OpenSpec artifacts when present; call out mismatches instead of silently changing scope.
4. Keep implementation details out of the PRD unless they affect product requirements or constraints.
5. If durable context emerges, recommend the target repository file for follow-up rather than embedding unrelated context.

## Output

When editing files, summarize what changed. Always include:

## Blockers

List missing inputs or unresolved decisions. Use `None` if there are no blockers.

## Suggestions

List concrete improvements, follow-up artifacts, or scope refinements.

## Recommendation

Recommend one of: proceed, revise before proceeding, or stop until blockers are resolved.
