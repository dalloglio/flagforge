# 0007 - Use Level 3 AWS Platform as Future Production Target

## Status

Accepted

Scope: Future target, not immediate implementation.

## Context

After local platform maturity, FlagForge should have a realistic cloud target architecture for production-style delivery practice.

## Decision

Use AWS as the future Level 3 target architecture with EKS, RDS PostgreSQL, ECR, ALB, IAM/OIDC, Argo CD, Helm, Kong, and observability tooling.

## Rationale

AWS provides a common production environment for Kubernetes, managed databases, container registries, identity integration, and ingress.

## Consequences

- Cloud implementation is explicitly future work.
- OpenTofu and Terragrunt should manage infrastructure when AWS work begins.
- Costs must be treated as part of the platform exercise.
- Local platform decisions should avoid blocking the AWS target.

## Alternatives considered

- Keep all work local forever: lower cost, but less production-like.
- Use another cloud first: viable, but AWS aligns with the selected target.

## Follow-up changes

- Add AWS platform changes only after local platform maturity.
