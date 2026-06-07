# Agent Playbooks

Use these playbooks and repo-local skills for risk-based planning, artifact creation, and role review. Not every role is required for every change; choose the smallest set that fits the scope and risk.

Project-specific Codex skills live in `.agents/skills/`. OpenSpec-generated skills may exist under `.codex/skills/openspec-*` and should be treated as OpenSpec-managed artifacts.

## Repo-local skills

- `flagforge-create-prd`: Draft or update a PRD from product context, the PRD template, and OpenSpec change artifacts.
- `flagforge-review-prd-as-pm`: Review PRDs, product scope, acceptance criteria, non-goals, and proposal alignment from the PM role.
- `flagforge-review-change-as-staff`: Review OpenSpec changes, designs, ADRs, and implementation plans for architecture fit and trade-offs.
- `flagforge-create-adr`: Document durable architecture, platform, tooling, workflow, or delivery decisions in `docs/adr/`.
- `flagforge-create-rfc-tdd`: Draft RFCs or technical designs using repository templates, ADRs, architecture context, and OpenSpec artifacts.
- `flagforge-create-test-plan`: Plan test coverage, validation gates, edge cases, residual risk, and release confidence for a change.
- `flagforge-create-threat-model`: Analyze assets, actors, trust boundaries, abuse cases, mitigations, and open security risks.
- `flagforge-create-runbook`: Document operations, diagnostics, rollback, alerts, validation, and escalation for service or platform work.
- `flagforge-review-pr-as-qa`: Review PRs for acceptance coverage, tests, API behavior, regressions, validation evidence, and residual quality risk.
- `flagforge-review-pr-as-sre`: Review PRs for reliability, deployability, rollback, configuration, alerts, runbooks, and operational readiness.

All FlagForge workflow skills should produce explicit blockers, suggestions, and a recommendation.
