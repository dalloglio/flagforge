---
name: flagforge-create-test-plan
description: Create or update a FlagForge test plan using the repository test-plan template, QA playbook, OpenSpec specs, and implementation context. Use when Codex is asked to plan test coverage, validation gates, edge cases, regression checks, or release confidence for a FlagForge change.
---

# Create FlagForge Test Plan

Create or update a risk-based test plan for a FlagForge change.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/domain-glossary.md`
- `docs/context/delivery-workflow.md`
- `docs/templates/test-plan.md`
- `docs/agent-playbooks/qa.md`
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks
- relevant implementation diff and existing tests when available

## Workflow

1. Use `docs/templates/test-plan.md` as the artifact structure.
2. Map requirements to unit, integration, API, contract, end-to-end, and manual checks as appropriate.
3. Include happy paths, edge cases, validation failures, status codes, error payloads, deterministic evaluation outcomes, and regression risks when relevant.
4. Name automation commands and expected gates, especially `npm test`, `npm run typecheck`, and `npm run verify` when applicable.
5. Call out residual risk rather than overstating coverage.

## Output

When editing files, summarize the coverage added or planned. Always include:

## Blockers

List missing requirements, unavailable fixtures, unclear expected behavior, or validation gaps that block confidence. Use `None` if there are no blockers.

## Suggestions

List non-blocking test improvements, automation candidates, and manual checks.

## Recommendation

Recommend one of: proceed with plan, revise plan first, add blocking tests first, or stop until blockers are resolved.
