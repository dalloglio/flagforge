# Product Context

## Original intent

FlagForge is a small production-like feature flag API used to practice
specification-driven delivery, API design, testing, platform engineering, and
agent-assisted development. "Production-like" describes the learning patterns,
not a production-readiness claim.

The product goal is to make feature flag behavior explicit, testable, and easy
to evolve through OpenSpec changes.

## Audience

- Developers learning feature flag system design.
- Contributors practicing OpenSpec and delivery workflow discipline.
- Reviewers assessing a public portfolio project with visible engineering decisions.

## Delivered v1 product capabilities

- Create and update feature flags.
- Evaluate flags from caller-provided context.
- Apply simple targeting rules and deterministic percentage rollout.
- Record and list audit events for successful flag mutations.
- Persist feature flags and audit events in PostgreSQL.
- Authenticate administrative API operations with a configured API key.
- Apply local in-process fixed-window rate limiting to authenticated
  administrative operations.
- Expose health, liveness, readiness, and Prometheus metrics endpoints.
- Support configurable local OpenTelemetry HTTP tracing with console export.

## Delivered v1 platform capabilities

- Level 1 local practice: Docker/Compose, PostgreSQL and migrations, Helm, kind,
  local Argo CD desired state and operating procedures, Kong,
  Prometheus/Grafana, and local OpenTelemetry instrumentation.
- Level 3 foundations/contracts: OpenTofu/Terragrunt structure, static RDS,
  EKS, and ALB resource contracts, guarded ECR workflow shape, AWS `dev` GitOps
  desired state, and operational runbooks.
- Level 1 is implemented and exercised at local scope. Level 3 is statically
  validated or prepared but externally dependent; no live AWS environment or
  production service is claimed.

## Deliberate v1 non-goals

- Tenancy, multiple flag environments, SDKs, segment management, and full RBAC.
- Distributed rate limiting and production identity or secret management.
- Account-backed AWS provisioning, live ECR publication, live EKS/Argo CD
  operation, production traffic, and continuously operated cloud services.
- Customer operation, commercial SaaS readiness, SLA/SLO or 24x7 support,
  validated disaster recovery, and multi-region delivery.

## Optional v2 directions

Possible v2 subjects include environments, SDKs, tenancy, RBAC, segments,
distributed rate limiting, production secret management, real cloud
provisioning, SLOs and alerting, an OpenTelemetry Collector, and multi-cluster
or multi-region exercises. They are optional directions, not issues, delivery
dates, or commitments.

## Current lifecycle

The v1 learning roadmap is complete and the repository is a completed portfolio
project in maintenance mode. Maintenance permits bug, security, dependency,
compatibility, and documentation fixes. New behavior requires prioritization
and a new OpenSpec change. `docs/project-status.md` is the source of truth for
the lifecycle, evidence classes, limitations, and release readiness.
