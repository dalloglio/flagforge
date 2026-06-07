---
name: flagforge-review-prd-as-pm
description: Review a FlagForge PRD or product proposal from the Product Manager role. Use when Codex is asked for PM review of a PRD, scope, acceptance criteria, user value, non-goals, sequencing, or alignment with an OpenSpec proposal.
---

# Review PRD As PM

Review product requirements for clarity, value, and delivery fit.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/product.md`
- `docs/context/delivery-workflow.md`
- `docs/agent-playbooks/pm.md`
- `docs/templates/prd.md`
- relevant `docs/adr/` entries
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks when available

## Workflow

1. Check whether the problem, users, goals, non-goals, requirements, and risks are explicit.
2. Compare PRD scope against OpenSpec artifacts or issue context when present.
3. Prioritize user value, measurable outcomes, acceptance criteria, sequencing, and dependencies.
4. Flag ambiguities that could cause engineering churn or invalid validation.
5. Keep the review role-focused; do not perform a full architecture or QA review unless needed to explain a product risk.

## Output

Lead with findings ordered by impact. Always include:

## Blockers

List product gaps that should block implementation or review approval. Use `None` if there are no blockers.

## Suggestions

List non-blocking improvements to scope, wording, acceptance criteria, risks, or sequencing.

## Recommendation

Recommend one of: approve, approve with follow-ups, revise before proceeding, or stop until blockers are resolved.
