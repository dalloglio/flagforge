## Context

FlagForge already keeps delivery knowledge in versioned repository artifacts: `AGENTS.md` for agent instructions, `docs/context/` for compact project context, `docs/adr/` for accepted decisions, `docs/templates/` for reusable artifact structures, `docs/agent-playbooks/` for role review guidance, and `openspec/changes/<change-id>/` for active change artifacts. The requested change adds repo-local Codex skills that package those conventions into explicit, triggerable workflows.

The change is documentation and workflow tooling only. It must not alter `src/`, `test/`, runtime behavior, public API contracts, dependencies, persistence, or OpenSpec-managed `.codex/skills/openspec-*` artifacts.

## Goals / Non-Goals

**Goals:**

- Create ten instruction-only Codex skills under `.agents/skills/`, one folder per skill.
- Use the built-in Codex `$skill-creator` skill as the authoring workflow for creating the repo-local skills, while overriding the output location to `.agents/skills/`.
- Give every skill a valid `SKILL.md` with only `name` and `description` frontmatter.
- Make descriptions specific enough for implicit activation by artifact type or review role.
- Make every skill instruct agents to produce structured outputs with blockers, suggestions, and a recommendation.
- Reference the repository sources each role or artifact needs, including `AGENTS.md`, `docs/adr/`, `docs/context/`, `docs/templates/`, `docs/agent-playbooks/`, and active `openspec/changes/<change-id>/` artifacts.
- Document skill usage in `docs/agent-playbooks/README.md`.
- Update `AGENTS.md` with the repo-local skill location and guidance to prefer the built-in `$skill-creator` skill for future skill work.

**Non-Goals:**

- Do not create scripts, references, assets, or generated helper code inside the skills.
- Do not add `agents/openai.yaml` metadata in this change unless later requested; the required deliverable is `SKILL.md`.
- Do not move, copy, or edit `.codex/skills/openspec-*`.
- Do not change application source, tests, API behavior, OpenSpec runtime specs, dependencies, or package scripts.
- Do not make any role review universally mandatory; skill use remains contextual and risk-based.

## Decisions

### Store FlagForge workflow skills in `.agents/skills/`

Repo-local project skills will live under `.agents/skills/<skill-name>/SKILL.md`.

Rationale: `.agents/skills/` keeps FlagForge workflow skills separate from OpenSpec-generated skills under `.codex/skills/openspec-*`, avoids modifying generated artifacts, and keeps project-specific agent guidance versioned with the repository.

Alternative considered: place the skills under `.codex/skills/`. This would make them look like Codex/OpenSpec-managed artifacts and conflicts with the requested boundary.

### Keep skills instruction-only

Each skill will contain only a concise `SKILL.md` body. No scripts, assets, references, or generated support files will be added.

Rationale: the requested workflows are judgment-heavy artifact creation and review tasks. High-freedom text instructions fit better than deterministic scripts, and the repository already has source templates and playbooks for details.

Alternative considered: include helper scripts to validate or generate skill bodies. This is unnecessary now and explicitly out of scope.

### Use `$skill-creator` to author the skills

Implementation must invoke and follow the built-in Codex `$skill-creator` skill when creating these FlagForge skills. The skill-creator workflow supplies the skill naming, frontmatter, description quality, progressive-disclosure, and validation guidance, but the generated or edited skills must be placed in `.agents/skills/` rather than the default Codex home skill directory.

Rationale: this keeps FlagForge skills aligned with Codex skill authoring conventions while preserving the repository-local location requested for project workflow skills.

Alternative considered: hand-author the skill folders directly without using `$skill-creator`. That would be simpler mechanically, but it would bypass the requested Codex-native skill creation workflow and could produce weaker trigger descriptions.

### Use shared output structure across skills

Every skill will require outputs with three explicit sections: blockers, suggestions, and recommendation. Creation skills may also produce or update the requested artifact, but they must still summarize blockers, suggestions, and recommendation.

Rationale: consistent review structure makes agent output scannable across PM, Staff Engineer, QA, SRE, security, and artifact-production workflows while preserving role-specific focus.

Alternative considered: use a different output format per skill. That may match each role more closely, but it increases friction and makes cross-role review harder to compare.

### Reference repository sources instead of duplicating them

Skill instructions will tell agents which existing repository files to read for each workflow. For example, PRD creation should use `docs/templates/prd.md`, ADR creation should use `docs/templates/adr.md` and `docs/adr/`, and role reviews should use the matching `docs/agent-playbooks/*.md`.

Rationale: repository files remain the source of truth, and skills stay compact. This matches the skill-creator principle of keeping skill bodies concise and avoiding duplicated durable context.

Alternative considered: copy template and playbook content into each skill. That would increase drift when templates or playbooks change.

## Risks / Trade-offs

- [Risk] Skill descriptions are too generic and trigger incorrectly. -> Mitigation: write descriptions that name the concrete artifact or review role and include the relevant trigger contexts.
- [Risk] Skills duplicate templates or playbooks and drift from source files. -> Mitigation: keep bodies concise and instruct agents to read repository templates/playbooks when needed.
- [Risk] Agents treat review skills as mandatory gates for every change. -> Mitigation: document in `docs/agent-playbooks/README.md` that role depth is risk-based and contextual.
- [Risk] Validation misses malformed skills because no custom validator exists. -> Mitigation: check every `.agents/skills/<name>/SKILL.md` for required frontmatter and run strict OpenSpec validation for the change.
