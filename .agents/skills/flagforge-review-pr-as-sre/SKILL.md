---
name: flagforge-review-pr-as-sre
description: Review a FlagForge pull request or implementation diff from the SRE role. Use when Codex is asked to assess reliability, deployability, rollback, health checks, alerts, runbooks, configuration, operational risk, or production readiness for a PR.
---

# Review PR As SRE

Review a PR or implementation diff for operational readiness.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/architecture.md`
- `docs/context/delivery-workflow.md`
- `docs/agent-playbooks/sre.md`
- `docs/templates/runbook.md`
- relevant platform, CI, and observability ADRs in `docs/adr/`
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks when relevant
- PR summary, implementation diff, deployment notes, runbook, and validation output

## Workflow

1. Assess reliability, deployability, rollback, configuration, health checks, error handling, alerts, and runbook readiness.
2. Keep review depth proportional to scope; documentation-only changes should not require production controls unless they create operational commitments.
3. Check whether the change assumes platform capabilities that do not exist yet.
4. Distinguish blocking operational risk from useful follow-up hardening.
5. Do not change code during review unless the user explicitly asks for fixes.

## Output

Lead with SRE findings ordered by severity and cite files or artifacts when available. Always include:

## Blockers

List operational risks that should block merge, deployment, or release confidence. Use `None` if there are no blockers.

## Suggestions

List non-blocking hardening, runbook, alerting, validation, or rollback improvements.

## Recommendation

Recommend one of: approve, approve with follow-ups, revise before merge, or stop until blockers are resolved.
