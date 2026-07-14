# AWS EKS and ALB Runtime Runbook

## Service

Completed FlagForge v1 Level 3 EKS and ALB static contracts for future
account-backed deployment work. See the
[project status](../project-status.md) for their evidence classification and
current limitations.

## Purpose

This runbook describes the safe operating expectations for the source-controlled EKS and ALB contracts. The committed `dev` composition is not account-backed plan/apply-ready until future networking, IAM/OIDC, account, and remote-state changes provide real dependencies and reviewed workflows.

## Preconditions

- Work from the active OpenSpec change and review the modules under `infra/aws/modules/eks/` and `infra/aws/modules/alb/`.
- Treat the first target as non-production `dev` learning infrastructure in `us-east-1`.
- Do not use real AWS credentials, remote state, account IDs, SSO URLs, local profile names, `.tfvars`, state files, plan files, kubeconfigs, cluster tokens, sensitive outputs, or command logs for default repository verification.
- Treat OpenTofu state, Terragrunt caches, generated provider files, plans, logs, outputs, kubeconfigs, and cluster access artifacts as sensitive generated artifacts.
- Confirm any future account-backed workflow has Staff, SRE, Security/LGPD, and QA review before planning, provisioning, generating kubeconfigs, or accessing a live cluster.

## Static Validation

Run optional IaC checks separately from repository verification:

```bash
make iac-aws-fmt-check
make iac-aws-validate
```

These checks must not require AWS credentials, remote state, live EKS, a live ALB, kubeconfig access, account-backed plans, or cloud provisioning. Missing OpenTofu or Terragrunt is a local prerequisite issue. OpenTofu may download public provider plugins during `init -backend=false`; that is still distinct from AWS account access.

`npm run verify` remains independent from OpenTofu, Terragrunt, AWS credentials, remote state, live EKS, live ALB, kubeconfig access, Docker, and cloud provisioning.

## Expected Local Failures

- `tofu: command not found`: install OpenTofu or record that optional IaC validation was skipped because the CLI is missing.
- `terragrunt: command not found`: install Terragrunt or record that Terragrunt formatting was skipped because the CLI is missing.
- provider plugin download failure: treat as a local network or plugin-cache prerequisite issue, not a reason to add AWS credentials.
- validation failures caused by mock IDs reaching provider API checks: stop and review the validation approach; do not replace mocks with real account values in source control.

## No-Resource Verification

Before considering this change complete, confirm:

- `npm run verify` does not require AWS credentials, remote state, EKS, ALB, kubeconfig access, Docker, or live cloud resources;
- package scripts, Make targets, CI workflows, runbooks, and docs do not run account-backed plan, apply, destroy, import, state mutation, force-unlock, taint, kubeconfig generation, cluster-admin access, or auto-approve workflows by default;
- `infra/aws/live/dev/us-east-1/eks/` uses only non-sensitive static-validation placeholders for network and IAM dependencies;
- `infra/aws/live/dev/us-east-1/alb/` uses only non-sensitive static-validation placeholders for network dependencies;
- source control does not include state files, plan files, generated provider files, `.terraform/`, `.terragrunt-cache/`, `.tfvars`, kubeconfigs, tokens, credentials, real account IDs, SSO URLs, or production values.

## Runtime Contract

The EKS contract defines:

- cluster name `flagforge-dev`;
- Kubernetes version `1.34`;
- public and private endpoint access assumptions for the learning target;
- a development-sized managed node group with one to three `t3.small` nodes and desired size two;
- baseline add-ons for VPC CNI, CoreDNS, kube-proxy, and EBS CSI;
- namespace assumption `flagforge`;
- AWS Load Balancer Controller service account assumption `aws-load-balancer-controller`.

The ALB contract defines:

- explicit exposure mode, with `dev` defaulting to `internet-facing`;
- future `internal` exposure as a private environment option;
- HTTP listener port `80`;
- future workload target port `3000`;
- `/readyz` health check path;
- ingress class `alb`;
- controller path `aws-load-balancer-controller`.

This change does not deploy FlagForge to EKS, install Argo CD in EKS, install the AWS Load Balancer Controller, change Helm chart behavior, select an image tag, materialize database secrets, configure DNS or TLS, or route production traffic.

## Network and Identity

The EKS module consumes:

- private subnet IDs;
- cluster security group IDs;
- EKS cluster role ARN;
- EKS node role ARN;
- optional ALB controller IAM role ARN.

The ALB module consumes:

- VPC ID;
- subnet IDs;
- ALB security group IDs.

The modules do not create VPCs, subnets, route tables, NAT gateways, internet gateways, shared security groups, IAM roles, OIDC roles, service accounts, pod identity bindings, or kubeconfigs. Future account-backed workflows must replace mock references with reviewed network and IAM/OIDC outputs.

Future identity work must use least-privilege, environment-scoped roles and reviewed trust policies. Administrator policies, broad principals, wildcard defaults, long-lived access keys, shared personal credentials, and committed kubeconfigs are not acceptable defaults.

## Deployment Handoff

Future Helm and Argo CD deployment work should consume existing contracts:

- ECR image publishing for repository and immutable tag shape;
- RDS PostgreSQL for endpoint, port, database name, username reference, managed secret reference, and private network references;
- EKS for cluster destination, namespace, OIDC issuer, and network references;
- ALB for ingress class, exposure mode, listener expectations, load balancer DNS reference, target group reference, and subnet/security-group references.

Future deployment work owns image tag selection, runtime secret materialization, Kubernetes manifests or Helm values, Argo CD application destinations, sync policy, ingress hostnames, and smoke checks.

## Cost and Operations

The first target is development-sized and learning-focused. Cost drivers for any future apply include:

- EKS control plane hours;
- managed node group instance hours;
- EBS volumes;
- NAT gateway and data transfer;
- ALB hours and LCUs;
- CloudWatch control plane and workload logs;
- public IPv4 charges;
- EKS add-on costs.

Current operational assumptions:

- public and private cluster endpoint access are represented for the `dev` learning target;
- internet-facing ALB exposure is the `dev` default for inspection;
- internal-only ALB exposure remains a future environment option;
- DNS, TLS, WAF, CloudFront, ExternalDNS, cert-manager, production edge hardening, and production traffic rollout are out of scope;
- observability beyond baseline control plane log declarations is future work.

## Rollback and Cleanup

Code rollback only reverts repository files. It does not remove live EKS, ALB, IAM, networking, kubeconfig, or generated access artifacts if a future workflow provisions resources.

For future live resources, choose the correct path:

- Code rollback: revert module, Terragrunt, or documentation changes when no resources were applied.
- Planned resource cleanup: use a reviewed cleanup workflow only after cost, access, traffic, data, and dependency impacts are approved.
- State recovery: restore or repair OpenTofu/Terragrunt state through a reviewed state procedure, never through ad hoc state mutation.
- Cluster access recovery: rotate or revoke generated kubeconfigs, roles, tokens, and controller identities through a reviewed access procedure.
- Ingress traffic rollback: move traffic away from the ALB through a reviewed routing or deployment workflow; code rollback alone does not change live traffic.
- Data-preserving remediation: keep dependent RDS resources intact unless a separate reviewed database cleanup path is approved.

## Prohibited Default Commands

Do not add these commands to default verification, CI, Make targets, package scripts, or automatic runbooks:

- `tofu plan`
- `terragrunt plan`
- `tofu apply`
- `terragrunt apply`
- `tofu destroy`
- `terragrunt destroy`
- `terragrunt run-all apply`
- `terragrunt run-all destroy`
- `tofu import`
- `tofu state rm`
- `tofu force-unlock`
- `tofu taint`
- kubeconfig generation
- cluster-admin access
- commands using `--auto-approve`

Future use of these commands must be an explicit human-reviewed workflow.

## Validation Evidence

Before this change is considered ready:

- OpenSpec strict validation passes for `add-eks-and-alb`;
- repository verification passes without AWS credentials, remote state, EKS, ALB, kubeconfig access, Docker, or live cloud resources;
- optional IaC validation is run locally when OpenTofu and Terragrunt are installed, or missing CLI prerequisites are documented;
- source inspection confirms no generated IaC artifacts, sensitive outputs, real credentials, account IDs, SSO URLs, personal data, customer data, or production-only identifiers are committed.

## Escalation

Request Staff review for EKS/ALB architecture, module/live boundaries, handoff outputs, networking dependency shape, GitOps sequencing, and application contract compatibility.

Request SRE review for cost, operational settings, validation separation, rollback, cleanup, state recovery, cluster access recovery, and failure modes.

Request Security/LGPD review for IAM/OIDC references, generated artifacts, kubeconfig handling, data minimization, tags, outputs, public exposure, and least-privilege assumptions.

Request QA review for validation strategy, acceptance criteria coverage, no-resource verification, and local-to-AWS behavior boundaries.
