## Context

FlagForge already has local Docker, PostgreSQL, kind, Helm, Argo CD, Kong, and Prometheus/Grafana practice paths. The AWS side now has an OpenTofu/Terragrunt foundation under `infra/aws/`, an RDS PostgreSQL contract, and an ECR image publishing handoff. ADR 0007 accepts AWS as the future Level 3 target architecture with EKS, RDS PostgreSQL, ECR, ALB, IAM/OIDC, Argo CD, Helm, Kong, and observability tooling.

This change introduces the EKS and ALB runtime foundation as source-controlled infrastructure and documentation. It must remain compatible with the existing Helm chart, local Argo CD path, ECR image contract, RDS PostgreSQL contract, and AWS IaC guardrails. It must not change FlagForge application behavior.

Stakeholders are Staff, SRE, Security/LGPD, QA, and future GitOps deployment changes that will need AWS cluster, ingress, image, and database references without redefining the runtime platform contract.

## Goals / Non-Goals

**Goals:**

- Add a source-controlled EKS and ALB runtime target in the existing OpenTofu and Terragrunt AWS structure.
- Keep reusable module code separate from environment composition.
- Represent the first target as a non-production `dev` learning environment in `us-east-1`, aligned with the ECR and RDS contracts.
- Define the EKS cluster, node capacity assumptions, Kubernetes provider handoff, ALB ingress/controller assumptions, and stable non-secret outputs for future GitOps deployment work.
- Keep networking, remote state, account-backed plans, and apply workflows explicit dependencies unless the implementation is limited to static mock references for validation.
- Document cost drivers, access assumptions, Security/LGPD guardrails, validation commands, rollback or cleanup expectations, and review gates.
- Keep public API behavior, database schema, OpenAPI contract, local platform behavior, and application runtime code unchanged.

**Non-Goals:**

- Production rollout or production traffic.
- Public API, domain, flag evaluation, audit-log, migration, or OpenAPI changes.
- Advanced multi-region, multi-account, private-only endpoint, autoscaling production, or disaster recovery design.
- Route 53, ACM certificate provisioning, WAF, CloudFront, ExternalDNS, cert-manager, production DNS ownership, or production edge hardening.
- RDS creation or application database contract changes.
- ECR repository provisioning or image publishing behavior changes.
- Helm chart behavior changes unless future deployment work needs separate reviewed values.
- Argo CD installation into EKS or application deployment to EKS.
- Automatic CI provisioning, default account-backed `plan`, `apply`, `destroy`, import, state mutation, or remote-state bootstrap workflows.

## Decisions

### Add an `aws-eks-alb-runtime` capability

EKS and ALB are platform runtime concerns, not application API behavior. A new capability keeps the cluster and ingress contract separate from the existing RDS, ECR, local Helm, and local Argo CD specs while allowing the AWS IaC foundation spec to acknowledge that EKS and ALB are now introduced by a reviewed follow-up change.

Alternative considered: modify only `aws-iac-foundation`. That would hide the EKS/ALB acceptance criteria inside a broad foundation capability and make future GitOps consumers harder to validate.

### Implement reusable EKS/ALB modules plus live `dev` composition

The implementation should add reusable module code under `infra/aws/modules/` and live composition under `infra/aws/live/dev/us-east-1/`. EKS and ALB concerns should be separated unless a shared helper removes real duplication without hiding review boundaries. The first environment remains `dev` because existing RDS and ECR contracts already use that convention and the issue describes a learning target rather than production.

Alternative considered: add only design artifacts. The issue allows approved design artifacts, but the repository already has a reviewable IaC foundation. Representing the target through static IaC keeps later deployment work closer to the real handoff.

### Keep network dependencies explicit

The EKS/ALB contract should consume VPC, subnet, route, NAT, internet gateway, and security group references as inputs or documented future outputs. The module may define EKS and ALB-specific security group rules only when they are scoped to supplied network references, but it should not silently create a whole networking baseline in this change.

If static validation needs placeholder values, they must be clearly non-sensitive mock outputs and invalid for real account-backed plan or apply. Future AWS networking and remote-state changes own real network outputs.

Alternative considered: create a minimal VPC together with EKS and ALB. That would collapse networking, cluster, ingress, cost, and security review into one high-risk change.

### Treat ALB exposure as an explicit environment decision

The AWS runtime target should define ALB as the ingress path for future EKS workloads and make the exposure mode an explicit environment value. The first `dev` contract should default to an internet-facing ALB for learning and inspection, while documenting that internal-only exposure remains a future environment choice and that production edge hardening is out of scope for this change.

The first contract should identify an ALB controller path and the handoff values future Helm or Argo CD deployment work will need, such as cluster name, OIDC provider reference, service account or IAM role reference, ingress class, load balancer endpoint reference, subnet references, security group references, and exposure mode.

Kong remains the local self-hosted gateway decision and may become an internal application gateway later, but this change should not require a Kong-on-EKS deployment or redefine local Kong behavior.

Alternative considered: expose the workload through Kubernetes `LoadBalancer` services without ALB controller assumptions. That is simpler, but it avoids the accepted ALB target and leaves future ingress ownership ambiguous.

Alternative considered: leave internet-facing versus internal exposure undecided. That would defer a real platform boundary decision into implementation and make subnet, security group, and cost review ambiguous.

### Keep identity and access least-privilege and reference-based

EKS requires IAM roles, cluster access, and likely OIDC/IRSA or EKS Pod Identity for the ALB controller. The contract should model role names or references without committing real account IDs, personal profiles, kubeconfigs, broad administrator policies, or long-lived credentials. Any future account-backed role must be environment-scoped and least privilege.

Alternative considered: defer IAM/OIDC details entirely. That would make the first EKS apply path likely to choose broad permissions for speed.

### Keep deployment consumption as future GitOps work

This change should provide outputs and documentation future Helm and Argo CD work can consume, but it should not deploy FlagForge to EKS. Future GitOps deployment work should decide how chart values consume ECR image tags, RDS secret references, cluster destination, namespace, ingress host, and sync policies.

Alternative considered: deploy the application as part of the EKS/ALB change. That would mix infrastructure foundation, GitOps environment bootstrapping, image selection, database secret materialization, and runtime validation in one change.

### Separate static validation from account-backed operations

Formatting and static validation may be documented or wrapped without AWS credentials. Account-backed `plan`, `apply`, `destroy`, import, state mutation, kubeconfig generation, and cluster access commands must remain explicit, human-reviewed workflows and must not enter `npm run verify`, default Make targets, or CI.

Alternative considered: add a plan or apply target now. That creates credential, remote-state, cost, access, and cleanup requirements that deserve separate review before automation is introduced.

### Document cost and rollback as operational concerns

EKS and ALB can create recurring costs from control plane hours, worker capacity, NAT/data transfer, ALB hours and LCUs, CloudWatch logs, public IPs, storage, and add-ons. Documentation should identify expected cost drivers and cleanup responsibilities before implementation is considered complete.

Rollback must distinguish code rollback, planned destroy or cleanup, cluster access recovery, state recovery, ingress traffic rollback, and data-preserving remediation. Code rollback alone does not remove live EKS, ALB, IAM, or network resources.

Alternative considered: defer cost and rollback until production. That would allow expensive learning resources to exist without an accountable cleanup model.

## Risks / Trade-offs

- [Risk] EKS and ALB IaC can look production-ready before account, networking, remote state, observability, and deployment workflows are mature. -> Mitigation: document the first target as non-production `dev` learning infrastructure and keep plan/apply out of default workflows.
- [Risk] The cluster contract can get ahead of networking foundations. -> Mitigation: consume network references as inputs or mock dependencies and mark mock values invalid for real plan or apply.
- [Risk] IAM/OIDC for EKS, cluster access, and the ALB controller can become over-permissive. -> Mitigation: require least-privilege, environment-scoped role references and Security/LGPD review before account-backed workflows.
- [Risk] The `dev` internet-facing ALB default can be mistaken for production traffic readiness. -> Mitigation: document exposure mode as an explicit non-production environment value and exclude production rollout, DNS/certificate ownership, WAF, production edge hardening, and application deployment from this change.
- [Risk] Static validation cannot prove that AWS quota, add-on, subnet, or IAM behavior will work in a live account. -> Mitigation: treat static validation as syntax and structure validation only, and require a later account-backed plan/apply readiness change.
- [Risk] Costs can accumulate quickly once applied. -> Mitigation: document cost drivers, expected learning-sized capacity, teardown expectations, and review gates before implementation.
- [Risk] Kubeconfigs, state, plans, outputs, and logs can expose sensitive metadata. -> Mitigation: keep generated artifacts out of source control and document handling expectations.

## Migration Plan

1. Add EKS and ALB OpenTofu modules and Terragrunt live composition for the first static-contract `dev` target.
2. Update AWS IaC documentation and runbooks with EKS/ALB scope, validation, cost, access, generated artifact handling, and cleanup or rollback expectations.
3. Add OpenSpec specs for `aws-eks-alb-runtime` and update the `aws-iac-foundation` delta so the foundation scope reflects the new reviewed runtime contract.
4. Run OpenSpec validation and repository verification that do not require AWS credentials or live cloud resources.
5. Optionally run IaC formatting or static validation when local OpenTofu and Terragrunt CLIs are installed, still without default provisioning.
6. Defer account-backed plan, apply, remote state, real networking dependencies, kubeconfig generation, cluster access, and deployment consumption to explicit reviewed workflows or follow-up changes.

Rollback for repository changes is code rollback. If a future human-reviewed apply creates EKS or ALB resources, cleanup must follow the documented resource cleanup, state recovery, or traffic remediation path rather than relying on code rollback alone.

## Open Questions

- Should the first account-backed EKS workflow use managed node groups only, Fargate profiles, or a mixed model?
- Which AWS networking change will provide the canonical VPC, private/public subnet, NAT, route, and security group outputs for this contract?
- Which EKS add-ons should be required in the first live target before GitOps deployment: VPC CNI, CoreDNS, kube-proxy, EBS CSI, metrics server, or ALB controller?
- What monthly cost ceiling should be used for the first account-backed `dev` EKS/ALB apply?
