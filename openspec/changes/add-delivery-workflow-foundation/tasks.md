## 1. Documentation Structure

- [x] 1.1 Add focused context documents for product intent, domain glossary, architecture boundaries, and delivery workflow under `docs/context/`.
- [x] 1.2 Update `docs/context.md` to act as a compact map that links to the focused context documents and current source-of-truth locations.
- [x] 1.3 Update `AGENTS.md` guidance to reference the new context, ADR, template, and playbook structure.
- [x] 1.4 Update `docs/decision-log.md` so it identifies ADRs as the durable source for accepted decisions while retaining chronological learning notes.

## 2. ADR Foundation

- [x] 2.1 Create `docs/adr/` with ADR files `0001-use-openspec-expanded-sdd.md` through `0018-use-role-based-review-gates.md` using the exact filenames required by the `delivery-workflow` spec.
- [x] 2.2 Ensure every ADR uses the required sections: status, context, decision, rationale, consequences, alternatives considered, and follow-up changes.
- [x] 2.3 Ensure the ADRs capture the consolidated Level 1 local platform, Level 3 AWS target, GitHub workflow, IaC, gateway, observability, staged security, PostgreSQL, and role-based review decisions.
- [x] 2.4 Replace future SQLite references in repository guidance with PostgreSQL as the accepted persistence target.

## 3. Delivery Assets

- [x] 3.1 Add delivery templates under `docs/templates/` for PRDs, RFCs, technical designs, ADRs, test plans, threat models, runbooks, and post-deploy reviews.
- [x] 3.2 Add role-based agent playbooks under `docs/agent-playbooks/` for PM, Product Design, Engineering Manager, Staff Engineer, Developer, QA, Security/LGPD, SRE, and Observability.
- [x] 3.3 Add an initial public-facing `README.md` that explains the project intent without claiming unimplemented runtime or platform capabilities.

## 4. GitHub Workflow Templates

- [x] 4.1 Add `.github/pull_request_template.md` prompting for summary, validation, linked planning artifacts, and risk notes.
- [x] 4.2 Add GitHub issue templates for feature, bug, tech debt, and RFC intake using stable filenames under `.github/ISSUE_TEMPLATE/`.

## 5. Command Wrappers

- [x] 5.1 Add a `Makefile` with thin wrappers for development, tests, type checking, linting, formatting checks, full verification, and strict OpenSpec validation.
- [x] 5.2 Ensure Makefile targets invoke existing npm scripts or OpenSpec commands without redefining quality gate behavior.

## 6. Validation

- [x] 6.1 Confirm the change does not modify `src/` or `test/` and does not implement API, persistence, deployment, gateway, observability, security scanning, or CI automation behavior.
- [x] 6.2 Run `openspec validate add-delivery-workflow-foundation --strict`.
- [x] 6.3 Run `npm run verify` and report any unrelated failures separately.
