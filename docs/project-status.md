# FlagForge Project Status

## Current lifecycle

- **Roadmap:** FlagForge v1 - learning roadmap completed.
- **Lifecycle:** Completed portfolio project - maintenance mode.
- **Status reviewed:** 2026-07-14 during archival of the completed
  `finalize-flagforge-v1` documentation change, based on repository commit
  `800038a` and the verification record below.
- **Release state:** package and Helm chart metadata use `1.0.0`, but a
  `v1.0.0` Git tag and published GitHub release are not evidenced by repository
  metadata and remain separate external actions.

This status means the planned v1 product, delivery, Level 1 local practice, and
Level 3 foundation/contract learning outcomes are represented in source control
at the evidence levels below. It does not mean FlagForge is a production SaaS,
a continuously operated AWS service, or covered by production support promises.

## Evidence classes

1. **Implemented and exercised locally:** behavior or configuration has local
   automated tests, explicit validation, or archived execution evidence.
2. **Implemented contract and statically validated:** source-controlled IaC,
   manifests, workflows, or desired state is checked for format, syntax,
   rendering, or contract shape without a live target.
3. **Prepared but externally dependent:** an executable integration shape
   exists, but use requires external accounts, credentials, protected settings,
   secrets, network/IAM outputs, or live infrastructure.
4. **Deliberately out of scope:** v1 does not claim the capability.
5. **Optional v2 direction:** a possible future subject with no backlog,
   delivery date, owner, or commitment created by this status.

The terms "production Docker image" and "production-style GitOps" describe
build or delivery patterns only. Static contracts, desired state, and local
simulation are not evidence of production readiness.

## Level 1 - completed local practice

| Item                                                                                                                               | Evidence class                    | Repository evidence                                                                                                           | Last verified evidence                                                                | Limits and prerequisites                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| API behavior, PostgreSQL persistence, audit log, admin API-key authentication, in-process rate limiting, and operational endpoints | Implemented and exercised locally | `src/`, `test/`, `docs/api/openapi.yaml`, main OpenSpec specs                                                                 | 2026-07-13 repository review at `67e0842`; current change verification recorded below | Requires PostgreSQL at runtime. Authentication is a single configured admin key; rate limiting is per process, not distributed.                    |
| Docker image, Compose runtime, PostgreSQL test service, migrations, and CI contract                                                | Implemented and exercised locally | `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`, `Makefile`, archived `add-docker-and-ci` and database changes | Archived changes dated 2026-06-09 through 2026-06-13                                  | Local workflows require Docker/PostgreSQL. A production-oriented image is not a production service.                                                |
| Helm API packaging                                                                                                                 | Implemented and exercised locally | `charts/flagforge-api/`, archived `2026-06-16-add-helm-chart`                                                                 | 2026-06-16 archive evidence                                                           | Helm validation requires the Helm CLI; the chart packages the API only and does not install platform dependencies.                                 |
| kind Kubernetes path                                                                                                               | Implemented and exercised locally | `infra/kind/`, Make targets, local runbook, archived `2026-06-25-add-kind-local-k8s`                                          | 2026-06-25 archive evidence                                                           | Requires Docker, kind, kubectl, Helm, local image, PostgreSQL, and explicit migrations. It is not EKS or production Kubernetes.                    |
| Local Argo CD desired state, sync, drift, and cleanup path                                                                         | Implemented and exercised locally | `infra/argocd/`, local runbook, archived `2026-06-26-add-argocd-gitops`                                                       | 2026-06-26 archive evidence                                                           | Requires a local cluster and Argo CD installation. `targetRevision: main` is source-controlled desired state, not continuous production operation. |
| Kong gateway                                                                                                                       | Implemented and exercised locally | `infra/kong/kong.yml`, Compose service, smoke target, archived `2026-06-15-add-kong-gateway-local`                            | 2026-06-15 archive evidence                                                           | Local DB-less routing only; Kong does not supply application authentication, distributed rate limiting, or production edge hardening.              |
| Prometheus and Grafana                                                                                                             | Implemented and exercised locally | `infra/observability/`, Compose services, smoke targets, archived `2026-06-27-add-prometheus-grafana-local`                   | 2026-06-27 archive evidence                                                           | Local metrics and a basic dashboard only; no production SLOs, alerts, collector, or AWS/vendor monitoring.                                         |
| OpenTelemetry HTTP tracing                                                                                                         | Implemented and exercised locally | `src/infrastructure/telemetry/`, telemetry tests, local runbook                                                               | 2026-07-09 commit `c97431f`                                                           | Disabled by default; console is the only exporter. No Collector, OTLP, custom domain spans, or vendor backend.                                     |

Level 1 completion means the intended local practice paths and their
source-controlled procedures were delivered. Environment-dependent smoke checks
may be rerun for release evidence; they do not prove production operation.

## Level 3 - completed foundations/contracts

| Item                                                         | Evidence class                                | Repository evidence                                                                                        | Last verified evidence                                                         | Limits and external prerequisites                                                                                                                                              |
| ------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OpenTofu/Terragrunt foundation and static validation         | Implemented contract and statically validated | `infra/aws/`, `Makefile`, archived `2026-07-02-add-opentofu-terragrunt-aws-foundation`                     | 2026-07-01 commit `4b56159`; current static gate remains release-time evidence | Requires OpenTofu, Terragrunt, and provider/plugin availability. No remote state, account-backed plan/apply, or AWS credentials are part of default validation.                |
| RDS PostgreSQL contract                                      | Implemented contract and statically validated | `infra/aws/modules/rds-postgresql/`, `infra/aws/live/dev/us-east-1/rds-postgresql/`, RDS runbook           | 2026-07-04 commit `1cc3f88`                                                    | Mock network inputs are invalid for live use. Real networking, account, state, access, secret materialization, migration execution, and cost approval remain external.         |
| EKS and ALB contracts                                        | Implemented contract and statically validated | `infra/aws/modules/eks/`, `infra/aws/modules/alb/`, `infra/aws/live/dev/us-east-1/`, EKS/ALB runbook       | 2026-07-08 commit `103d9f5`                                                    | Real VPC/subnets/security groups, IAM/OIDC roles, remote state, provider permissions, kubeconfig, controller installation, DNS/TLS, and traffic operation are absent.          |
| ECR publishing workflow                                      | Prepared but externally dependent             | `.github/workflows/publish-ecr-image.yml`, ECR runbook, archived `2026-07-08-add-ecr-and-image-publishing` | 2026-07-08 archive evidence                                                    | Disabled until ECR, lifecycle policy, protected environment, OIDC role, account setting, and `ECR_PUBLISHING_ENABLED=true` exist. No image push is evidenced.                  |
| AWS `dev` GitOps desired state and credential-free rendering | Implemented contract and statically validated | `infra/aws/gitops/dev/us-east-1/`, `npm run gitops:aws:validate`, AWS GitOps runbook                       | 2026-07-09 commits `546965d` and `86ac195`                                     | Placeholder image/account data and external Secret references are intentional. No live cluster destination or Argo CD sync is evidenced.                                       |
| AWS live publication, provisioning, and sync                 | Prepared but externally dependent             | Handoffs and guarded procedures in AWS/ECR/GitOps runbooks                                                 | Not executed                                                                   | Requires separately reviewed accounts, credentials, resources, settings, identities, secrets, access, and approvals. Missing prerequisites are blockers, not evidence waivers. |

No real AWS RDS, EKS, ALB, ECR publication, cloud deployment, production traffic,
or continuously operated environment is claimed. Level 3 completion means the
planned foundations, contracts, desired state, safety boundaries, and runbooks
were delivered at static or externally dependent evidence levels.

## V1 completion criteria

- Product behavior, API contract, PostgreSQL persistence, tests, delivery
  assets, Level 1 local practice, and Level 3 foundations/contracts are present
  in source control and represented by main specs or archived OpenSpec changes.
- Planned implementation pull requests and roadmap issues were reported closed
  in a point-in-time check on 2026-07-10; this must be rechecked at release time.
- Main specs and the finalization change passed strict OpenSpec validation, and
  `npm run verify` passed before the documentation change was completed.
- Product, architecture, lifecycle, limitations, evidence classes, runbooks,
  and contributor guidance are consolidated without unsupported production or
  live AWS claims.
- The final diff must contain no runtime, test, migration, OpenAPI, dependency,
  workflow, Helm, GitOps, or IaC behavior change and no secrets or sensitive
  generated artifacts.
- PM/Product, Staff Engineer, QA, SRE, and Security/LGPD review outcomes are
  recorded in
  `openspec/changes/archive/2026-07-14-finalize-flagforge-v1/reviews.md`.
- The finalization change is archived, and its versioned current-project-status
  requirement is part of the main `delivery-workflow` spec.

## Limitations and deliberate non-goals

V1 does not claim tenancy, multiple flag environments, SDKs, segments, full
RBAC, distributed rate limiting, production identity or secret rotation,
customer operation, commercial SaaS readiness, SLA/SLO commitments, production
alerts, validated disaster recovery, multi-region delivery, 24x7 support, or a
continuously operated AWS environment.

Local credentials documented in examples are explicit non-secret development
defaults. They are not a production secret-management strategy. Static IaC and
GitOps validation cannot prove cloud permissions, quotas, networking, IAM/OIDC,
resource behavior, cost, live reconciliation, backup/restore, or incident
response.

## Maintenance mode

- The committed v1 learning roadmap has no planned functional features.
- Bug fixes, security fixes, dependency maintenance, documentation corrections,
  and compatibility upkeep may continue.
- New product or platform behavior requires explicit prioritization, a new
  OpenSpec change, and a decision whether it is maintenance or a future roadmap.
- Maintenance mode does not archive the repository, close contribution paths,
  promise response times, or create operational support obligations.

Optional v2 directions include multiple flag environments, SDKs, tenancy, RBAC,
segments, distributed rate limiting, production secret management, real cloud
provisioning, SLOs and alerting, OpenTelemetry Collector integration, and
multi-cluster or multi-region exercises. These are ideas only, not backlog or
release commitments.

## Future `v1.0.0` release checklist

Release publication is an external action and is not performed by the
`finalize-flagforge-v1` documentation change. Record the date, commit SHA, tool
versions, command result, and evidence location for every mandatory gate.

### Mandatory host-only gates

```bash
npm ci
npm run verify
npm run build
openspec validate --all --strict
```

### Mandatory tool-backed gates

```bash
npm run test:postgres
docker build -t flagforge-api:v1.0.0 .
helm lint charts/flagforge-api
helm lint charts/flagforge-api -f charts/flagforge-api/values-local.yaml
make iac-aws-fmt-check
make iac-aws-validate
npm run gitops:aws:validate
```

The tool-backed gates require the documented PostgreSQL, Docker, Helm,
OpenTofu, Terragrunt, and provider/plugin prerequisites. If any prerequisite is
unavailable, publication is blocked until the command succeeds in a capable
environment; the gate is not waived or reported as passed.

| Gate group                             | Status                            | Evidence                                                                      |
| -------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| Mandatory host-only release gates      | Not run as a complete release set | Run at release time against the exact candidate commit.                       |
| Mandatory tool-backed release gates    | Not run as a complete release set | Run in a capable environment before publication; missing tools block release. |
| Git tag and GitHub release publication | Not published by this change      | Requires separate approval after all mandatory gates and reviews pass.        |

### Optional local smoke evidence

When prerequisites are available, record Docker Compose, Kong, Prometheus,
Grafana, kind, Helm deployment, local Argo CD sync, `/healthz`, `/readyz`, and
`/metrics` results using `docs/runbooks/local-development.md`. An optional skip
must name its missing prerequisite. Optional local evidence never proves AWS or
production operation.

Release validation must not run AWS `plan`, `apply`, `destroy`, live cloud sync,
ECR publishing, cloud provisioning, database mutation outside the isolated test
database, or deployment automatically. Those actions require their own reviewed
and approved workflow.

## Review and verification record

| Gate                              | Current result                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff Engineer                    | Approved with follow-ups on 2026-07-13; see change-local `reviews.md`.                                                                                                                                                                                                                                                                               |
| PM/Product                        | Approved with follow-ups on 2026-07-13; optional v2 remains uncommitted and external state requires release-time recheck.                                                                                                                                                                                                                            |
| QA                                | Approved with follow-ups on 2026-07-13; mandatory tool-backed release gates remain unrun release blockers.                                                                                                                                                                                                                                           |
| SRE                               | Approved with follow-ups on 2026-07-13; no live AWS or production-operation evidence is claimed.                                                                                                                                                                                                                                                     |
| Security/LGPD                     | Approved with follow-ups on 2026-07-13; diff and sensitive-data checks found only documented non-secret placeholders.                                                                                                                                                                                                                                |
| Documentation change verification | Passed before archival on 2026-07-13: change/all strict OpenSpec validation, 24 OpenSpec items, `npm run verify`, 11 test files/83 tests, OpenAPI, formatting, links, scope, and sensitive-data checks. Repassed after sync and archival on 2026-07-14: `npm run verify`, 23 active OpenSpec specs, 11 test files/83 tests, OpenAPI, and formatting. |

## Repository-external follow-ups

- Recheck immediately before release that no planned issues, pull requests, or
  forgotten OpenSpec changes remain open. Closing or reclassifying external
  items requires separate approval.
- Confirm issue #60 remains closed as duplicate/completed and references PR #35
  plus `openspec/changes/archive/2026-06-14-health-readiness-metrics/`. The
  2026-07-10 discovery found the references absent; adding a comment is a
  separately approved GitHub action.
- Prepare and publish the `v1.0.0` tag and GitHub release only after every
  mandatory gate and review passes and a separate release action is approved.
- Retain the GitHub Project as historical portfolio evidence for now; project
  archival is not required for maintenance mode and no project mutation is part
  of this change.
- README and this versioned status are the selected maintenance signal. No
  repository setting change is planned; any later setting change is a separate
  approved action.

Point-in-time GitHub observations can change and must not be treated as permanent
repository truth.
