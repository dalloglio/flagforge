---
name: flagforge-create-rfc-tdd
description: Create or update a FlagForge RFC or technical design document using repository templates, architecture context, ADRs, and OpenSpec change artifacts. Use when Codex is asked to draft an RFC, TDD, technical design, proposal analysis, rollout plan, or implementation design.
---

# Create FlagForge RFC/TDD

Create or update an RFC or technical design document for FlagForge delivery work.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/architecture.md`
- `docs/context/delivery-workflow.md`
- `docs/templates/rfc.md`
- `docs/templates/technical-design.md`
- relevant `docs/adr/` entries
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks when available

## Workflow

1. Choose `docs/templates/rfc.md` for proposal/trade-off decisions and `docs/templates/technical-design.md` for implementation design.
2. Describe current context, constraints, goals, non-goals, design, alternatives, impact, validation, rollout, rollback, and risks as applicable.
3. Preserve FlagForge boundaries: API concerns in `src/api/`, domain rules in `src/domain/`, and persistence/platform work only when requested by the active change.
4. Align public behavior with OpenSpec specs and durable decisions with ADRs.
5. Surface unclear scope or missing validation before inventing implementation details.

## Output

When editing files, summarize the artifact path and key design choice. Always include:

## Blockers

List missing requirements, design contradictions, or decisions needed before implementation. Use `None` if there are no blockers.

## Suggestions

List non-blocking refinements, ADR candidates, validation additions, or sequencing improvements.

## Recommendation

Recommend one of: proceed, revise before proceeding, defer, or stop until blockers are resolved.
