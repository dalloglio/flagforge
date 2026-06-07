## Why

FlagForge uses OpenSpec, ADRs, templates, and role-based review playbooks as part of its learning and delivery workflow, but agents currently need to rediscover those conventions manually for each artifact or review. Repo-local Codex skills will make those workflows easier to invoke consistently while keeping project-specific agent guidance versioned with the repository.

## What Changes

- Add instruction-only Codex skills under `.agents/skills/`, with one folder per skill and a `SKILL.md` in each folder.
- Create skills for producing or reviewing workflow artifacts:
  - `flagforge-create-prd`
  - `flagforge-review-prd-as-pm`
  - `flagforge-review-change-as-staff`
  - `flagforge-create-adr`
  - `flagforge-create-rfc-tdd`
  - `flagforge-create-test-plan`
  - `flagforge-create-threat-model`
  - `flagforge-create-runbook`
  - `flagforge-review-pr-as-qa`
  - `flagforge-review-pr-as-sre`
- Ensure every skill has YAML frontmatter with `name` and a trigger-specific `description`, follows the built-in Codex skill creation guidance, and remains instruction-only unless deterministic scripts are explicitly requested later.
- Make skill outputs structured around blockers, suggestions, and a recommendation.
- Have skills reference applicable repository sources such as `AGENTS.md`, `docs/adr/`, `docs/context/`, `docs/templates/`, `docs/agent-playbooks/`, and `openspec/changes/<change-id>/`.
- Add short documentation in `docs/agent-playbooks/README.md` explaining when to use each repo-local skill.
- Update `AGENTS.md` to document that FlagForge workflow skills live in `.agents/skills/`, while `.codex/skills/openspec-*` remains OpenSpec-managed.
- Do not change `src/`, `test/`, public API behavior, existing OpenSpec-managed skills, or create scripts in this change.

## Capabilities

### New Capabilities

- `agent-workflow-skills`: Defines repo-local Codex skills for creating and reviewing FlagForge planning, architecture, quality, security, and operations artifacts.

### Modified Capabilities

- None.

## Impact

- Affected repository areas: `.agents/skills/`, `docs/agent-playbooks/README.md`, and `AGENTS.md`.
- Affected workflow: Codex agents gain project-specific skills for PRDs, PM review, Staff Engineer review, ADRs, RFC/TDD, test plans, threat models, runbooks, QA PR review, and SRE PR review.
- Validation includes checking that each skill is located under `.agents/skills/`, contains a valid `SKILL.md`, and that `openspec validate add-flagforge-agent-skills --strict` passes.
- No runtime code, tests, dependencies, persistence, or API contracts are affected.
