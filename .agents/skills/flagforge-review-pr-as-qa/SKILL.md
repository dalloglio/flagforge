---
name: flagforge-review-pr-as-qa
description: Review a FlagForge pull request or implementation diff from the QA role. Use when Codex is asked to assess test coverage, acceptance criteria coverage, API validation, edge cases, regressions, failure behavior, or release confidence for a PR.
---

# Review PR As QA

Review a PR or implementation diff for quality coverage and release confidence.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/domain-glossary.md`
- `docs/context/delivery-workflow.md`
- `docs/agent-playbooks/qa.md`
- `docs/templates/test-plan.md`
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks when relevant
- PR summary, implementation diff, existing tests, and validation output

## Workflow

1. Check implementation behavior against requirements, specs, acceptance criteria, and test plan.
2. Review coverage for happy paths, edge cases, validation failures, API status codes, payloads, deterministic behavior, and regressions.
3. Inspect validation evidence; distinguish unrun checks from failed checks.
4. Recommend focused tests rather than broad cleanup.
5. Do not change code during review unless the user explicitly asks for fixes.

## Output

Lead with QA findings ordered by severity and cite files or artifacts when available. Always include:

## Blockers

List coverage gaps or failed validation that should block merge or release confidence. Use `None` if there are no blockers.

## Suggestions

List non-blocking test additions, manual checks, or release notes.

## Recommendation

Recommend one of: approve, approve with follow-ups, add tests before merge, or stop until blockers are resolved.
