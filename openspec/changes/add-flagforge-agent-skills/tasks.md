## 1. Skill Scaffolding

- [ ] 1.1 Create `.agents/skills/` if it does not already exist
- [ ] 1.2 Use the built-in `$skill-creator` workflow to scaffold one instruction-only folder for each required FlagForge workflow skill under `.agents/skills/`
- [ ] 1.3 Ensure each skill folder contains only `SKILL.md` and does not add scripts, references, assets, generated helper code, or `agents/openai.yaml`

## 2. Skill Instructions

- [ ] 2.1 Write valid `name` and trigger-specific `description` frontmatter for every `SKILL.md`
- [ ] 2.2 Write artifact creation guidance for PRD, ADR, RFC/TDD, test plan, threat model, and runbook skills using the applicable repository templates and context files
- [ ] 2.3 Write role review guidance for PM, Staff Engineer, QA, and SRE skills using the applicable playbooks and change or PR artifacts
- [ ] 2.4 Require every skill output to include explicit blockers, suggestions, and recommendation sections

## 3. Repository Guidance

- [ ] 3.1 Add short documentation to `docs/agent-playbooks/README.md` explaining when to use each repo-local FlagForge workflow skill
- [ ] 3.2 Update `AGENTS.md` with the `.agents/skills/` location rule, the `.codex/skills/openspec-*` boundary, and the preference for `$skill-creator`

## 4. Validation

- [ ] 4.1 Verify every required skill exists under `.agents/skills/<skill-name>/SKILL.md`
- [ ] 4.2 Verify every skill frontmatter has a matching `name` and a non-empty trigger-specific `description`
- [ ] 4.3 Verify no `src/`, `test/`, `.codex/skills/openspec-*`, API behavior, dependencies, persistence, package scripts, or runtime files were changed
- [ ] 4.4 Run `openspec validate add-flagforge-agent-skills --strict`
