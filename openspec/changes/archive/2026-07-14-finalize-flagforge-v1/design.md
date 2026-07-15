## Context

FlagForge is a public learning and portfolio project whose v1 roadmap has been delivered through archived OpenSpec changes and reviewed pull requests. The repository now contains:

- a PostgreSQL-backed TypeScript/Express feature flag API with targeting rules, deterministic percentage rollouts, audit events, admin API-key authentication, in-process admin rate limiting, OpenAPI, operational endpoints, Prometheus metrics, and configurable local OpenTelemetry tracing;
- a Level 1 local practice path using Docker, Docker Compose, PostgreSQL, Helm, kind, local Argo CD, Kong, Prometheus, and Grafana;
- Level 3 AWS foundations consisting of OpenTofu/Terragrunt modules and static `dev` compositions for RDS, EKS, and ALB, a guarded ECR publishing workflow, AWS GitOps desired state, and operations runbooks;
- OpenSpec specs and archives, ADRs, context documents, test plans, runbooks, templates, and role-based review gates.

The implementation history supports closing the learning roadmap, but the current narrative does not. Concrete inconsistencies discovered before this proposal include:

- `README.md` still describes platform engineering, kind, and the AWS `dev` path as future work and does not present a single final status or maintenance-mode statement.
- `docs/context.md` says the MVP avoids persistence and authentication even though PostgreSQL and admin API-key authentication are implemented.
- `docs/context/product.md` puts the completed Level 1 platform and implemented Level 3 foundations under `Future scope`, and still lists authentication and cloud infrastructure implementation as current non-goals.
- `docs/context/architecture.md` describes the Level 1 platform as work that "will" happen and treats Level 3 broadly as future, although static RDS/EKS/ALB resource contracts and AWS GitOps desired state exist.
- `docs/context/delivery-workflow.md` defines documentation sources of truth but does not yet assign ownership for a current lifecycle/evidence record after roadmap completion.
- `AGENTS.md` still tells contributors that PostgreSQL is a future persistence target, contradicting the implemented architecture and current test workflow.
- several accepted ADRs correctly preserve the decision-time language of future follow-ups, but that historical language is easy to misread as current status when no current status document is linked.
- `infra/aws/README.md` and AWS runbooks contain a mix of correct future prerequisites and stale pre-GitOps sequencing language; those references require contextual review, not bulk replacement.
- `package.json` and the Helm chart already use application version `1.0.0`, but there is no basis in the repository alone to claim that a `v1.0.0` Git tag or GitHub release has been published.
- issue #60 is already closed and duplicates behavior delivered by PR #35 plus the archived `health-readiness-metrics` change, but its current GitHub record has no explanatory comment linking those artifacts.

Discovery on 2026-07-10 found no active OpenSpec changes, no open GitHub issues, and no open pull requests. Those observations are useful closure evidence, but repository documentation must present them as a point-in-time check and keep release/publication actions separate from source changes.

Stakeholders for the closing pass are portfolio readers, contributors, maintainers, and PM/Product, Staff Engineer, QA, SRE, and Security/LGPD reviewers.

## Goals / Non-Goals

**Goals:**

- Make the final v1 status accurate, concise, and externally reviewable.
- Define `FlagForge v1 - learning roadmap completed` using evidence already present in source control and point-in-time GitHub checks.
- Set the current state to `Completed portfolio project - maintenance mode` without implying that the repository is archived or unsupported by definition.
- Separate local implementation/execution, credential-free static validation, externally blocked integration, deliberate non-goals, and optional v2 ideas.
- Explain why Level 1 is complete and why Level 3 foundations are complete even though AWS resources have not been provisioned.
- Define sources of truth, v1 completion criteria, release checks, review gates, limitations, and administrative follow-ups.
- Reconcile stale language without rewriting valid historical decisions or future prerequisites.
- Preserve all runtime, API, persistence, infrastructure, deployment, and package behavior.

**Non-Goals:**

- No new feature flag behavior, API endpoint, OpenAPI change, domain rule, database migration, persistence change, SDK, tenancy, RBAC, environment model, segment model, or distributed rate limiting.
- No dependency update, broad refactor, new dashboard, new alert, new SLO, OpenTelemetry Collector, production secret rotation, or production operations commitment.
- No AWS credentials, account IDs, kubeconfigs, real secret values, account-backed `plan`, `apply`, `destroy`, ECR activation, live Argo CD sync, cloud deployment, or resource provisioning.
- No automatic Git tag, GitHub release, issue mutation, project archival, or repository setting change.
- No claim of commercial SaaS readiness, production readiness, 24x7 support, SLA/SLO, validated disaster recovery, multi-region operation, or continuously operated AWS environment.
- No committed v2 roadmap. Possible v2 themes remain optional directions that require a new product decision and OpenSpec change.

## Decisions

### Define completion against the learning roadmap, not production readiness

The v1 roadmap is complete when its planned learning outcomes and repository artifacts are delivered and verified at their intended evidence level. Completion requires:

- planned v1 issues completed or deliberately closed with rationale;
- implementation pull requests merged;
- related OpenSpec changes archived and main specs valid;
- CI and the documented completion gate green;
- product, architecture, status, limitations, and runbook documentation consolidated;
- no committed secrets or sensitive generated artifacts;
- operational runbooks and applicable review gates present;
- remaining external dependencies and non-goals explicit.

This definition permits a completed portfolio project without asserting real production operation. A production SaaS definition would additionally require customer and tenancy concerns, production identity and secrets, live infrastructure, security and reliability objectives, operational ownership, incident response, backup/restore evidence, and sustained service operation. Those are outside v1.

Alternative considered: define completion only after a real AWS deployment. Rejected because the accepted roadmap deliberately delivered static contracts, desired state, and guarded integrations without authorizing cloud provisioning.

### Use five evidence classifications

Every platform/status claim will use one of these meanings:

1. **Implemented and exercised locally**: source-controlled behavior or configuration with local automated tests, explicit local validation, or archived execution evidence. This class covers the API and Level 1 practice paths at the scope proven by their specs and runbooks.
2. **Implemented contract and statically validated**: source-controlled IaC, manifests, workflows, or desired state checked for format, syntax, rendering, or contract shape without contacting a live target. RDS, EKS, ALB, and AWS GitOps default validation belong here.
3. **Prepared but externally dependent**: executable integration shape exists, but actual use requires account resources, credentials, protected environment settings, network/IAM outputs, a live cluster, or external secret materialization. ECR publishing activation and AWS live sync belong here.
4. **Deliberately out of scope**: the project does not claim the capability in v1.
5. **Optional v2 direction**: a possible future subject, not an issue, backlog commitment, release promise, or accepted delivery date.

The documentation must not use "implemented" alone where readers could confuse static contract code with live execution. It must not use "production" as a synonym for a production-oriented image, production-style GitOps exercise, or target architecture.

Alternative considered: a binary done/not-done roadmap. Rejected because it obscures the difference between local execution, static IaC validation, and account-backed operation.

### Make `docs/project-status.md` the current lifecycle source of truth

Create `docs/project-status.md` as the compact current record for:

- status and maintenance-mode meaning;
- Level 1 and Level 3 completion tables with evidence class, repository evidence, last verified date or commit when available, and known limitations;
- v1 completion criteria and evidence checklist;
- current limitations and deliberate non-goals;
- optional v2 directions;
- mandatory host-only and tool-backed `v1.0.0` release checks;
- local optional smoke checks;
- review-gate outcomes;
- point-in-time administrative follow-ups.

`README.md` will summarize and link to it. The context files will describe current product and architecture state without duplicating the full release checklist.

Alternative considered: place all status content in `README.md`. Rejected because a large release and evidence matrix would make the public entrypoint harder to scan and would duplicate operational detail already owned by runbooks.

### Preserve clear source-of-truth boundaries

The closing documentation will use these authorities:

- `openspec/specs/`: required public, runtime, platform-contract, and delivery behavior.
- `docs/api/openapi.yaml`: canonical public HTTP contract.
- runtime code and tests: implemented behavior and executable regression evidence.
- archived OpenSpec changes and Git history: implementation chronology and completion evidence.
- `docs/adr/`: accepted decisions and decision-time rationale, including historical future language.
- `docs/context/`: concise current product, architecture, vocabulary, and delivery context.
- `AGENTS.md`: current contributor and agent guardrails, linked to the lifecycle source rather than repeating obsolete implementation assumptions.
- `docs/project-status.md`: current roadmap/lifecycle classification and release readiness record.
- `docs/runbooks/`: operational procedures, prerequisites, rollback, cleanup, and limitations.
- workflows, Helm, GitOps, and IaC files: declared automation or infrastructure contracts, not evidence of live execution by themselves.
- GitHub issues, pull requests, Actions, projects, tags, releases, environments, and repository settings: external point-in-time state that must be verified before claiming it.

Historical ADR and decision-log wording will not be rewritten mechanically. If an accepted ADR can be mistaken for current status, implementation may add a short non-normative implementation-status note or link to `docs/project-status.md` without changing the accepted decision. Current-state contradictions in README, `AGENTS.md`, context, and AWS overview documents must be corrected. `docs/context/delivery-workflow.md` will name `docs/project-status.md` as the owner of current lifecycle and evidence classification.

Alternative considered: update every occurrence of "future". Rejected because many occurrences correctly identify unimplemented networking, IAM/OIDC, remote state, secret management, production edge, alerting, and live operations.

### Define maintenance mode narrowly

Maintenance mode means:

- the committed v1 learning roadmap has no planned functional features;
- bug fixes, security fixes, dependency maintenance, documentation corrections, and compatibility upkeep may continue;
- a new product or platform feature requires explicit prioritization, a new OpenSpec change, and a decision whether it belongs to maintenance or an optional v2 roadmap;
- maintenance mode does not by itself archive the GitHub repository, close contribution paths, guarantee support response times, or create operational obligations.

Optional v2 subjects may include multiple flag environments, SDKs, tenancy, RBAC, segments, distributed rate limiting, production secret management, real cloud provisioning, SLOs and alerting, OpenTelemetry Collector integration, multi-cluster, or multi-region work. They must be labeled optional and uncommitted.

Alternative considered: declare the repository frozen. Rejected because maintenance fixes and documentation improvements remain valid even when the feature roadmap is complete.

### Separate repository changes from external administrative actions

The implementation phase may edit only documentation and OpenSpec artifacts. It may inspect external state, but it must not publish or mutate it automatically.

Repository work includes documentation consolidation, link/command review, review-gate records, validation output, and the release checklist.

External follow-ups include:

- confirm no planned issues or pull requests remain open at release time;
- confirm issue #60 is classified as duplicate/completed and references PR #35 and the archived `health-readiness-metrics` change; add a GitHub comment only through a separately approved action if the references remain absent;
- decide whether to archive or close the GitHub Project;
- create the `v1.0.0` tag/release after mandatory checks pass;
- decide whether repository settings or the README should signal maintenance mode beyond the committed documentation.

The fact that `package.json` and Helm `appVersion` already contain `1.0.0` is metadata, not proof of a published release.

Alternative considered: publish the release as part of this change. Rejected because the user explicitly requires a documentary checklist only and release publication changes external state.

### Require every release gate while separating its execution prerequisites

The future `v1.0.0` checklist will distinguish two mandatory gate groups and one optional smoke group.

**Mandatory host-only release gates:**

```bash
npm ci
npm run verify
npm run build
openspec validate --all --strict
```

**Mandatory tool-backed release gates:**

```bash
npm run test:postgres
docker build -t flagforge-api:v1.0.0 .
helm lint charts/flagforge-api
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
make iac-aws-fmt-check
make iac-aws-validate
npm run gitops:aws:validate
```

The tool-backed gates require the documented PostgreSQL, Docker, Helm, OpenTofu, Terragrunt, and provider/plugin prerequisites. An unavailable prerequisite is not a pass or waiver: it blocks release publication until the command succeeds in a capable environment. This does not block completion of the documentation change itself, whose repository verification is defined separately in `test-plan.md`.

**Optional local smoke evidence:** Docker Compose, Kong, Prometheus, Grafana, kind, Helm deployment, local Argo CD sync, and `/healthz`, `/readyz`, and `/metrics`. These checks strengthen portfolio evidence but are environment-dependent and do not prove production or AWS operation.

No release check may run AWS provisioning or live production sync by default.

### Use explicit review gates for final claims

- PM/Product validates the v1 definition, delivered scope, non-goals, closing message, and uncommitted v2 language.
- Staff Engineer validates architecture boundaries, evidence classification, ADR/spec consistency, and absence of unsupported claims.
- QA validates the test plan, commands, completion criteria, documentary regression checks, and release checklist.
- SRE validates local/AWS distinctions, runbook references, rollback/cleanup language, observability limits, and absence of false operational readiness.
- Security/LGPD validates secret absence, data claims, IAM/OIDC wording, generated-artifact boundaries, and absence of real account, token, kubeconfig, or credential material.

Review outcomes should be recorded in the implementation pull request or a change-local review artifact if the workflow requires one. They do not require runtime tests beyond the existing regression gate because this change does not modify runtime behavior.

### Add one narrow delta to `delivery-workflow`

The change will not create a lifecycle-only capability. It will add one requirement to the existing `delivery-workflow` capability because maintenance mode creates a lasting documentation-governance obligation: the repository must retain a versioned current project status, keep lifecycle and evidence classifications aligned with future maintenance decisions, and prevent static contracts from being represented as live execution.

The requirement governs repository documentation, not API behavior, runtime behavior, persistence, or deployment behavior. It does not require the project to remain permanently complete; if a v2 roadmap is accepted, the status document must be updated through the normal reviewed workflow.

Alternative considered: no delta. Rejected because the need for a current lifecycle/evidence source persists after this one-time consolidation and the strict OpenSpec workflow requires durable requirements to be represented in a capability. Alternative considered: a new `project-lifecycle` capability. Rejected because `delivery-workflow` already owns versioned context and documentation governance, so a new capability would be artificial.

## Risks / Trade-offs

- [Risk] Completed language is read as production-ready SaaS. -> Mitigation: pair every completion statement with portfolio/learning scope and explicit operational limitations.
- [Risk] Static AWS resource definitions are read as deployed infrastructure. -> Mitigation: use the evidence classifications and repeat that no account-backed plan/apply or real AWS operation is proven.
- [Risk] "Production Docker image" or "production-style GitOps" is read as live production service. -> Mitigation: describe build/deployment patterns precisely and reserve production readiness for externally evidenced operation.
- [Risk] Historical ADR wording remains apparently stale. -> Mitigation: keep ADRs as decision history, link current status, and annotate only when needed to prevent a current false claim.
- [Risk] Bulk future-language cleanup removes valid prerequisites. -> Mitigation: review each occurrence against specs, implementation, and runbooks; do not use mechanical replacement.
- [Risk] Documentation duplicates commands and drifts. -> Mitigation: make `docs/project-status.md` own the release checklist and link runbooks for detailed procedures.
- [Risk] Point-in-time GitHub checks become stale. -> Mitigation: date them and require release-time revalidation instead of presenting them as permanent facts.
- [Risk] Existing `1.0.0` metadata is confused with a published release. -> Mitigation: explicitly separate package/chart metadata, Git tag, and GitHub release evidence.
- [Risk] Maintenance mode discourages necessary security upkeep. -> Mitigation: define allowed maintenance categories and require OpenSpec only when behavior or durable delivery requirements change.
- [Risk] Documentation-only work accidentally changes generated or functional files. -> Mitigation: verify the final diff excludes `src/`, `test/`, migrations, OpenAPI, dependencies, workflows, Helm, GitOps, and IaC unless a separately justified documentation-only correction is approved.
- [Risk] Tool-dependent release checks cannot run in every environment. -> Mitigation: record the missing prerequisite as a release blocker and run the mandatory gate in a capable environment before publication; only optional smoke checks may be skipped with rationale.

## Migration Plan

1. Inventory current claims in README, `AGENTS.md`, context, ADRs, decision log, AWS overview, runbooks, specs, and archives against the five evidence classifications.
2. Update README, `AGENTS.md`, and current context documents, then add `docs/project-status.md` so detailed status has one owner and `docs/context/delivery-workflow.md` records that ownership.
3. Reconcile remaining stale current-state language while preserving historical statements and valid future prerequisites.
4. Record review-gate outcomes and run the documentary/test verification plan.
5. Run strict OpenSpec validation and `npm run verify` for this documentation change. Before publishing `v1.0.0`, run every mandatory host-only and tool-backed release gate in an environment with the required prerequisites.
6. Confirm the diff contains no functional, API, database, dependency, provisioning, or secret changes.
7. Leave GitHub issue/project/release/repository-setting actions as separately approved follow-ups.

Rollback is a documentation revert. It does not require application rollback, database rollback, infrastructure cleanup, or deployment rollback because this change performs none of those actions.

## Open Questions

- Should the GitHub Project be archived after the closing change, or retained as historical portfolio evidence?
- Should repository settings be changed to signal maintenance mode, or is the README/status declaration sufficient?
- Should the future `v1.0.0` release use only the existing version metadata, or include a short curated release note assembled from the archived roadmap?
- Which accepted ADRs, if any, need a non-normative current-status annotation after README/context/project status are updated? This must be decided occurrence by occurrence during implementation.
