# Product Context

## Intent

FlagForge is a small production-like feature flag API used to practice specification-driven delivery, API design, testing, platform engineering, and agent-assisted development.

The product goal is to make feature flag behavior explicit, testable, and easy to evolve through OpenSpec changes. The current API supports in-memory flag management, deterministic evaluation, percentage rollouts, and audit-log inspection.

## Audience

- Developers learning feature flag system design.
- Contributors practicing OpenSpec and delivery workflow discipline.
- Reviewers assessing a public portfolio project with visible engineering decisions.

## Current scope

- Create and update feature flags.
- Evaluate flags from caller-provided context.
- Apply simple targeting rules and deterministic percentage rollout.
- Record and list audit events for successful flag mutations.
- Keep runtime storage in memory for the current MVP.

## Future scope

- PostgreSQL persistence through a dedicated OpenSpec change.
- Local platform simulation with Docker Compose, kind, Helm, Argo CD, Kong, PostgreSQL, Prometheus, Grafana, and OpenTelemetry.
- Future AWS target architecture with EKS, RDS PostgreSQL, ECR, ALB, IAM/OIDC, Argo CD, Helm, Kong, and observability tooling.

## Non-goals for current MVP

- Authentication, authorization, tenancy, environments, SDKs, and segment management.
- Production deployment behavior.
- Cloud infrastructure implementation.
- Durable persistence before the accepted PostgreSQL persistence change.
