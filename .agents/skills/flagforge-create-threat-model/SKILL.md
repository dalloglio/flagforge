---
name: flagforge-create-threat-model
description: Create or update a FlagForge threat model using the repository threat-model template, security context, ADRs, and OpenSpec change artifacts. Use when Codex is asked to analyze abuse cases, privacy risks, trust boundaries, API input risk, secrets, availability, or security mitigations for a FlagForge change.
---

# Create FlagForge Threat Model

Create or update a threat model for a FlagForge feature, API, or platform change.

## Sources

Read the smallest useful set of:

- `AGENTS.md`
- `docs/context.md`
- `docs/context/architecture.md`
- `docs/context/domain-glossary.md`
- `docs/templates/threat-model.md`
- `docs/agent-playbooks/security-lgpd.md` when present and relevant
- relevant `docs/adr/` entries
- active `openspec/changes/<change-id>/` proposal, specs, design, and tasks

## Workflow

1. Use `docs/templates/threat-model.md` as the artifact structure.
2. Identify assets, actors, trust boundaries, abuse cases, privacy risks, injection risks, access risks, and availability risks.
3. Tie mitigations to concrete threats and owners; avoid generic security advice.
4. Respect current scope: no authentication, authorization, tenancy, persistence, or platform behavior unless the active change requests it.
5. Record unresolved or accepted risks explicitly.

## Output

When editing files, summarize the threat model scope and highest risks. Always include:

## Blockers

List security or privacy unknowns that block implementation, merge, or release confidence. Use `None` if there are no blockers.

## Suggestions

List non-blocking mitigations, validation checks, documentation updates, or future security work.

## Recommendation

Recommend one of: proceed, proceed with mitigations, revise before proceeding, or stop until blockers are resolved.
