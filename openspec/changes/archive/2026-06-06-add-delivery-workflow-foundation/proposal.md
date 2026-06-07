## Why

FlagForge is moving from isolated feature work into a broader software delivery simulation that will include persistence, platform engineering, CI/CD, GitOps, observability, and security practices. Those upcoming changes depend on decisions that have already been discussed, but many of those decisions still live only in chat or informal notes.

Without a versioned delivery foundation, future OpenSpec changes can reopen settled choices, drift across tools and architecture directions, or implement platform work before the project has a shared source of truth. This change turns those accepted decisions into repository artifacts that Codex, Cursor, contributors, and future OpenSpec changes can cite.

The goal is to establish the decision and workflow foundation before implementation-heavy changes begin, especially PostgreSQL persistence and local platform work.

## What Changes

- Add versioned context documents for product intent, domain vocabulary, architecture boundaries, and delivery workflow.
- Add the required ADR set that consolidates accepted decisions for OpenSpec SDD, GitHub-based project management, Cursor and Codex CLI, public repository positioning, PostgreSQL persistence, local-first platform evolution, AWS target architecture, kind, Helm, Argo CD, Kong, OpenTofu and Terragrunt, observability, CI gates, staged security scanning, hexagonal architecture, context engineering, and role-based review gates.
- Update existing repository guidance so durable decisions live in `docs/adr/`, while `docs/decision-log.md` remains a chronological learning log.
- Replace future SQLite references with PostgreSQL as the accepted persistence target.
- Add an initial public-facing `README.md`.
- Add GitHub pull request and issue templates for feature, bug, tech debt, and RFC workflows.
- Add reusable templates for PRDs, RFCs, technical design documents, ADRs, test plans, threat models, runbooks, and post-deploy reviews.
- Add agent playbooks for PM, Product Design, Engineering Manager, Staff Engineer, Developer, QA, Security/LGPD, SRE, and Observability review roles.
- Add a `Makefile` as a thin wrapper around existing commands.
- Do not alter API behavior, runtime code, tests, persistence, Docker, Kubernetes, Argo CD, Kong, OpenTelemetry, or new CI implementation in this change.

## Capabilities

### New Capabilities

- `delivery-workflow`: Defines the repository's versioned delivery foundation, including context documents, ADRs, templates, agent playbooks, GitHub workflow templates, and role-based review practices.

### Modified Capabilities

- `ci-quality`: Adds expectations for a thin `Makefile` wrapper around existing verification and development commands without replacing the existing npm scripts or changing current CI behavior.

## Impact

- Affected files: `README.md`, `AGENTS.md`, `docs/context/**`, `docs/adr/**`, `docs/templates/**`, `docs/agent-playbooks/**`, `docs/decision-log.md`, `.github/**`, and `Makefile`.
- OpenSpec impact: add a new `delivery-workflow` capability spec and a delta for the existing `ci-quality` capability.
- API impact: none.
- Runtime impact: none.
- Test impact: no `src/` or `test/` changes; final validation includes `openspec validate add-delivery-workflow-foundation --strict` and `npm run verify` because the change affects OpenSpec artifacts and tooling wrappers.
