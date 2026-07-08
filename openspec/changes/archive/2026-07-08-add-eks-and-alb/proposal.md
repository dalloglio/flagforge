## Why

FlagForge needs the next Level 3 AWS runtime step after the AWS IaC foundation, RDS PostgreSQL contract, and ECR image handoff are in place. This change defines a reviewable EKS and ALB foundation so future GitOps deployment work can target AWS without changing application behavior.

## What Changes

- Add an AWS EKS and ALB runtime infrastructure contract using the existing OpenTofu and Terragrunt AWS structure.
- Define environment, region, network, ALB exposure, identity, access, cost, validation, and operational assumptions for the first non-production AWS learning target.
- Expose stable non-secret handoff outputs for future Helm and Argo CD deployment work, including cluster access references, load balancer endpoint references, ingress/controller assumptions, and security-group or subnet dependencies.
- Keep public API behavior, application runtime behavior, database schema, OpenAPI contract, and local platform behavior unchanged.
- Keep default repository verification credential-free and separate from account-backed `plan`, `apply`, `destroy`, import, and state mutation workflows.

## Capabilities

### New Capabilities

- `aws-eks-alb-runtime`: Defines the AWS EKS cluster, ALB ingress path, handoff outputs, validation boundaries, operations assumptions, cost expectations, and review gates for the Level 3 runtime foundation.

### Modified Capabilities

- `aws-iac-foundation`: Updates the AWS IaC foundation scope so EKS and ALB are no longer listed only as future out-of-scope resources once this reviewed runtime foundation is introduced.

## Impact

- Affects AWS infrastructure assets under `infra/aws/` and related platform documentation or runbooks.
- Affects OpenSpec platform requirements for AWS IaC and the new EKS/ALB runtime capability.
- Does not affect `src/`, `test/`, public HTTP APIs, OpenAPI behavior, local kind/Helm/Argo CD behavior, PostgreSQL persistence semantics, or application feature flag behavior.
- Requires Staff, SRE, Security/LGPD, and QA review because this is high-risk cloud platform foundation work with cost, networking, identity, and operational implications.
