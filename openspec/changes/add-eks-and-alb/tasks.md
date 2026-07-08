## 1. IaC Structure

- [ ] 1.1 Add reusable EKS and ALB module structure under `infra/aws/modules/` with OpenTofu version constraints, variables, outputs, and README documentation, keeping EKS and ALB concerns separate unless a shared helper clearly reduces duplication without hiding review boundaries.
- [ ] 1.2 Add Terragrunt live composition for the `dev` `us-east-1` EKS and ALB static contract under `infra/aws/live/dev/us-east-1/`.
- [ ] 1.3 Represent required network dependencies as inputs, documented future outputs, or clearly marked non-sensitive mock values for static validation only.
- [ ] 1.4 Apply the existing mandatory tag convention to taggable EKS and ALB resources or document any unsupported tag surfaces.

## 2. Runtime and Ingress Contract

- [ ] 2.1 Define EKS cluster contract settings, including cluster name, Kubernetes version, endpoint access assumptions, node capacity model, add-on assumptions, and non-production `dev` positioning.
- [ ] 2.2 Define ALB ingress path assumptions, including ingress class or controller path, listener or port expectations, explicit exposure mode, `dev` internet-facing default, internal-only future environment option, subnet references, and security group references.
- [ ] 2.3 Define non-secret handoff outputs for future GitOps deployment work, including cluster, OIDC provider, namespace, ingress, load balancer, and network references.
- [ ] 2.4 Keep application code, tests, public API behavior, OpenAPI contract, database schema, Helm chart behavior, and local platform behavior unchanged unless a task explicitly documents a required no-op verification.

## 3. Security, Access, and Sensitive Artifacts

- [ ] 3.1 Document cluster role, node role, OIDC, ALB controller identity, and service account or pod identity assumptions as least-privilege references without real account IDs or personal credentials, and keep IAM/OIDC automation static-contract-only unless a future reviewed workflow introduces account-backed behavior.
- [ ] 3.2 Ensure source-controlled examples avoid secrets, real AWS account IDs, SSO URLs, personal profile names, personal data, customer data, production-only identifiers, kubeconfigs, tokens, and real `.tfvars` values.
- [ ] 3.3 Update `.gitignore` or relevant documentation if needed so generated IaC artifacts, Terragrunt caches, state, plans, logs, kubeconfigs, and sensitive outputs stay out of source control.

## 4. Documentation and Operations

- [ ] 4.1 Update `infra/aws/README.md` with EKS/ALB scope, directory structure, validation commands, account-backed workflow boundaries, cost drivers, and future sequencing.
- [ ] 4.2 Add or update an EKS/ALB runbook covering prerequisites, static validation, expected local failures, no-resource verification, rollback or cleanup expectations, escalation, and commands that must not run by default.
- [ ] 4.3 Document how future Helm and Argo CD deployment work should consume ECR image references, RDS references, EKS cluster references, and ALB ingress references without redefining those contracts.
- [ ] 4.4 Document required Staff, SRE, Security/LGPD, and QA review gates for EKS/ALB architecture, cost, identity, networking, validation, generated artifacts, and operations.

## 5. Validation

- [ ] 5.1 Add or update thin IaC validation wrappers only for credential-free formatting and static checks; do not add default account-backed `plan`, `apply`, `destroy`, import, state mutation, kubeconfig, or live-cluster commands.
- [ ] 5.2 Run OpenSpec strict validation for `add-eks-and-alb`.
- [ ] 5.3 Run repository verification with `npm run verify` and confirm it does not require AWS credentials, remote state, EKS, ALB, kubeconfig access, Docker, or live cloud resources.
- [ ] 5.4 Run optional IaC formatting or static validation when OpenTofu and Terragrunt are installed locally, and report skipped checks with the missing local prerequisite if unavailable.
