---
name: flagforge-create-runbook
description: Create or update a FlagForge operational runbook using the repository runbook template, SRE playbook, platform ADRs, and OpenSpec change artifacts. Use when Codex is asked to document operations, diagnostics, rollback, alerts, validation, escalation, or service readiness.
---

# Create FlagForge Runbook

Create or update an operational runbook for a FlagForge service, component, or platform capability.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/architecture.md`
- `docs/context/delivery-workflow.md`
- `docs/templates/runbook.md`
- `docs/agent-playbooks/sre.md`
- platform and observability ADRs in `docs/adr/` when relevant
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks

## Workflow

1. Use `docs/templates/runbook.md` as the artifact structure.
2. Document service purpose, preconditions, procedures, diagnostics, remediation, rollback, alerts, validation, and escalation.
3. Keep operational guidance aligned with the current project level; do not assume cloud, Kubernetes, persistence, or observability exists before the active change introduces it.
4. Prefer executable commands and concrete validation checks when known.
5. Identify missing alerts, health checks, dashboards, or access requirements as gaps.

## Output

When editing files, summarize the runbook path and operational scope. Always include:

## Blockers

List missing operational inputs, access assumptions, rollback gaps, or readiness issues. Use `None` if there are no blockers.

## Suggestions

List non-blocking runbook improvements, alerting additions, validation checks, or follow-up platform work.

## Recommendation

Recommend one of: proceed, proceed with follow-ups, revise before relying on the runbook, or stop until blockers are resolved.
