## ADDED Requirements

### Requirement: Repo-local workflow skills

The repository SHALL provide FlagForge workflow Codex skills under `.agents/skills/`, with one directory per skill and a `SKILL.md` file in each directory.

#### Scenario: Required skill directories exist

- **WHEN** a developer inspects `.agents/skills/`
- **THEN** the repository contains skill directories for `flagforge-create-prd`, `flagforge-review-prd-as-pm`, `flagforge-review-change-as-staff`, `flagforge-create-adr`, `flagforge-create-rfc-tdd`, `flagforge-create-test-plan`, `flagforge-create-threat-model`, `flagforge-create-runbook`, `flagforge-review-pr-as-qa`, and `flagforge-review-pr-as-sre`

#### Scenario: Skills use repository-local location

- **WHEN** the FlagForge workflow skills are added
- **THEN** they are placed under `.agents/skills/` and not under `.codex/skills/openspec-*`

### Requirement: Skill metadata and scope

Each FlagForge workflow skill SHALL be instruction-only and SHALL contain YAML frontmatter with a `name` and trigger-specific `description`.

#### Scenario: Skill frontmatter is valid

- **WHEN** a developer opens any `.agents/skills/<skill-name>/SKILL.md`
- **THEN** the file contains YAML frontmatter with `name` matching the skill directory and a `description` that identifies the artifact type or review role that triggers the skill

#### Scenario: Skills remain instruction-only

- **WHEN** the workflow skills are added
- **THEN** no scripts, assets, references, or generated helper code are added inside the skill directories

### Requirement: Skill workflow guidance

Each FlagForge workflow skill SHALL instruct agents to use the applicable repository sources for the requested artifact or review.

#### Scenario: Creation skills reference source artifacts

- **WHEN** an agent uses a creation skill for PRDs, ADRs, RFC/TDDs, test plans, threat models, or runbooks
- **THEN** the skill directs the agent to consult the relevant files from `AGENTS.md`, `docs/context.md`, `docs/context/`, `docs/templates/`, `docs/adr/`, `docs/decision-log.md`, and active `openspec/changes/<change-id>/` artifacts as applicable

#### Scenario: Review skills reference role playbooks

- **WHEN** an agent uses a review skill for PM, Staff Engineer, QA, or SRE review
- **THEN** the skill directs the agent to consult the matching `docs/agent-playbooks/` role guidance and the relevant proposal, design, specification, task, implementation, or PR materials

### Requirement: Structured skill outputs

Each FlagForge workflow skill SHALL require agent responses to include blockers, suggestions, and a recommendation.

#### Scenario: Review output is structured

- **WHEN** an agent completes a role-based review using a FlagForge workflow skill
- **THEN** the response includes explicit blockers, suggestions, and recommendation sections

#### Scenario: Creation output is structured

- **WHEN** an agent creates or updates an artifact using a FlagForge workflow skill
- **THEN** the response summarizes blockers, suggestions, and a recommendation after the artifact work

### Requirement: Workflow skill documentation

The repository SHALL document when to use each FlagForge workflow skill and how the repo-local skill location relates to OpenSpec-managed skills.

#### Scenario: Agent playbook README describes skills

- **WHEN** a developer opens `docs/agent-playbooks/README.md`
- **THEN** the document lists the FlagForge workflow skills and explains the artifact or review context for each skill

#### Scenario: Agent instructions describe skill locations

- **WHEN** an agent reads `AGENTS.md`
- **THEN** it documents that FlagForge workflow skills live in `.agents/skills/` and that OpenSpec-managed skills remain under `.codex/skills/openspec-*`

### Requirement: No runtime behavior impact

The workflow skill change SHALL NOT alter FlagForge runtime behavior, public API behavior, tests, dependencies, persistence, or package scripts.

#### Scenario: Runtime source is untouched

- **WHEN** the workflow skill change is implemented
- **THEN** no files under `src/` or `test/` are changed for this capability

#### Scenario: Public API remains unchanged

- **WHEN** the workflow skill change is implemented
- **THEN** no public API contracts, feature flag evaluation rules, persistence behavior, or package scripts are changed
