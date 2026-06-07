## ADDED Requirements

### Requirement: Versioned delivery context

The repository SHALL provide versioned delivery context documents that describe product intent, domain vocabulary, architecture boundaries, and delivery workflow conventions.

#### Scenario: Focused context documents are available

- **WHEN** a contributor inspects the repository documentation
- **THEN** the repository contains `docs/context/product.md`, `docs/context/domain-glossary.md`, `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`

#### Scenario: Root context map links focused context

- **WHEN** a contributor reads `docs/context.md`
- **THEN** it links to the focused context documents and summarizes how project knowledge is organized

### Requirement: Accepted architecture and workflow decisions

The repository SHALL record accepted architecture, platform, workflow, tooling, and review-role decisions as ADRs under `docs/adr/`.

#### Scenario: ADR set is present

- **WHEN** a contributor inspects `docs/adr/`
- **THEN** it contains `0001-use-openspec-expanded-sdd.md`, `0002-use-github-for-product-and-engineering-management.md`, `0003-use-cursor-and-codex-cli-for-agentic-development.md`, `0004-use-public-github-repository-as-portfolio.md`, `0005-use-postgresql-for-persistence.md`, `0006-use-level-1-local-platform-before-cloud.md`, `0007-use-level-3-aws-platform-as-future-production-target.md`, `0008-use-kind-for-local-kubernetes.md`, `0009-use-helm-for-kubernetes-packaging.md`, `0010-use-argocd-for-gitops-delivery.md`, `0011-use-kong-as-self-hosted-api-gateway.md`, `0012-use-opentofu-and-terragrunt-for-iac.md`, `0013-use-opentelemetry-prometheus-and-grafana-for-observability.md`, `0014-use-github-actions-for-ci-and-quality-gates.md`, `0015-use-security-scanning-in-staged-adoption.md`, `0016-use-hexagonal-architecture-and-ddd-lite.md`, `0017-use-versioned-context-engineering-assets.md`, and `0018-use-role-based-review-gates.md`

#### Scenario: ADRs use a consistent structure

- **WHEN** a contributor opens an ADR
- **THEN** it includes status, context, decision, rationale, consequences, alternatives considered, and follow-up changes

#### Scenario: Decision log points to ADRs

- **WHEN** a contributor reads `docs/decision-log.md`
- **THEN** it identifies ADRs as the durable source for accepted decisions while retaining chronological learning notes

### Requirement: Reusable delivery templates

The repository SHALL provide reusable templates for planning, design, quality, security, operations, and review artifacts.

#### Scenario: Delivery templates are available

- **WHEN** a contributor inspects `docs/templates/`
- **THEN** it contains templates for PRDs, RFCs, technical design documents, ADRs, test plans, threat models, runbooks, and post-deploy reviews

#### Scenario: Delivery template files use stable names

- **WHEN** a contributor inspects `docs/templates/`
- **THEN** it contains `prd.md`, `rfc.md`, `technical-design.md`, `adr.md`, `test-plan.md`, `threat-model.md`, `runbook.md`, and `post-deploy-review.md`

#### Scenario: Templates define expected outputs

- **WHEN** a contributor opens a delivery template
- **THEN** it describes the sections or outputs expected from that artifact without requiring runtime implementation changes

### Requirement: Role-based agent playbooks

The repository SHALL provide role-based agent playbooks for common delivery review roles.

#### Scenario: Review role playbooks are available

- **WHEN** a contributor inspects `docs/agent-playbooks/`
- **THEN** it contains playbooks for PM, Product Design, Engineering Manager, Staff Engineer, Developer, QA, Security/LGPD, SRE, and Observability roles

#### Scenario: Review role playbook files use stable names

- **WHEN** a contributor inspects `docs/agent-playbooks/`
- **THEN** it contains `pm.md`, `product-design.md`, `engineering-manager.md`, `staff-engineer.md`, `developer.md`, `qa.md`, `security-lgpd.md`, `sre.md`, and `observability.md`

#### Scenario: Playbooks define review focus

- **WHEN** a contributor opens a role playbook
- **THEN** it describes that role's review focus, expected inputs, and expected outputs

### Requirement: GitHub contribution workflow templates

The repository SHALL provide GitHub pull request and issue templates for the selected GitHub-based planning and contribution workflow.

#### Scenario: Pull request template is available

- **WHEN** a contributor opens a pull request in the repository
- **THEN** the repository provides a pull request template that prompts for summary, validation, linked planning artifacts, and risk notes

#### Scenario: Issue templates are available

- **WHEN** a contributor creates an issue in the repository
- **THEN** the repository provides templates for feature, bug, tech debt, and RFC intake

#### Scenario: GitHub template files use stable names

- **WHEN** a contributor inspects `.github/`
- **THEN** it contains `pull_request_template.md` and issue templates for feature, bug, tech debt, and RFC intake

### Requirement: Delivery foundation preserves runtime behavior

The delivery workflow foundation SHALL NOT alter the public API contract, runtime source code, tests, persistence behavior, deployment configuration, gateway configuration, observability implementation, or CI automation implementation.

#### Scenario: Runtime files remain unchanged

- **WHEN** the delivery workflow foundation change is reviewed
- **THEN** it does not modify files under `src/` or `test/`

#### Scenario: Future implementation remains separate

- **WHEN** a contributor reads the delivery workflow foundation artifacts
- **THEN** they identify PostgreSQL persistence, platform, GitOps, gateway, observability, security scanning, and CI implementation as future changes rather than implemented behavior
