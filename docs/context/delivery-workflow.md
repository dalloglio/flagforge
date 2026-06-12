# Delivery Workflow Context

## Source of truth

- OpenSpec specs define public behavior.
- OpenSpec changes define proposed behavior before implementation.
- `docs/adr/` records durable accepted architecture, platform, tooling, and workflow decisions.
- `docs/context/` records compact project context, glossary, architecture boundaries, and delivery workflow conventions.
- `docs/templates/` provides reusable artifact templates.
- `docs/agent-playbooks/` provides review-role guidance.

## Workflow

1. Create or continue an OpenSpec change for behavior or delivery foundation work.
2. Produce proposal, design, specs, and tasks as required by the workflow.
3. Implement the tasks with minimal scoped changes.
4. Update specs, ADRs, context docs, templates, and playbooks when decisions become durable.
5. Run focused checks while iterating.
6. Run `npm run verify` before considering implementation complete.
7. Archive completed OpenSpec changes so accepted behavior moves into the main specs.

## GitHub workflow

The project uses GitHub Projects, Issues, Pull Requests, and Wiki as the management and collaboration system. Jira and Confluence are intentionally not part of the current workflow.

Issue templates capture feature, bug, tech debt, and RFC intake. Pull requests should link planning artifacts, summarize validation, and call out risk.

## Role-based review

Role playbooks simulate real delivery review responsibilities. PM, Product Design, Engineering Manager, Staff Engineer, Developer, QA, Security/LGPD, SRE, and Observability roles can be used as applicable to the change.

Not every role blocks every change. The review depth should match the risk and scope.

## Command wrappers

`npm run verify` remains the local completion gate. It includes OpenAPI validation through `npm run openapi:validate`. The `Makefile` provides thin convenience wrappers and must not redefine the behavior of npm scripts or OpenSpec validation.
