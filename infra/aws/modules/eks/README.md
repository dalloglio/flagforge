# EKS Module

This module defines the FlagForge AWS EKS runtime contract target. It is a
static, reviewable infrastructure contract for future Level 3 AWS deployment
work, not a default account-backed plan or apply workflow.

## Resources

- one EKS cluster;
- one development-sized EKS managed node group;
- baseline EKS add-on declarations for VPC CNI, CoreDNS, kube-proxy, and EBS CSI.

The module does not create VPCs, subnets, route tables, NAT gateways, internet
gateways, security groups, IAM roles, OIDC roles, Kubernetes service accounts,
kubeconfigs, namespaces, Helm releases, Argo CD applications, or workloads.

## Contract Assumptions

- `cluster_name`: non-sensitive cluster name such as `flagforge-dev`.
- `kubernetes_version`: defaults to `1.34` for the first learning target.
- endpoint access: public and private endpoint access are represented as inputs;
  the first `dev` composition is learning-focused and not production-ready.
- node capacity: defaults to a small managed node group of one to three
  `t3.small` nodes, desired size two.
- add-ons: VPC CNI, CoreDNS, kube-proxy, and EBS CSI are represented without
  pinning versions by default.
- namespace: future workload namespace is documented as `flagforge`; this module
  does not create Kubernetes resources.

## External Dependencies

Future account-backed workflows must replace committed mock references with
reviewed outputs for:

- private subnet IDs;
- cluster security group IDs;
- EKS cluster role ARN;
- EKS node role ARN;
- optional ALB controller IAM role ARN.

Mock values in the live `dev` composition are non-sensitive static-validation
placeholders only and are invalid for real plan or apply.

## Identity and Access

IAM and OIDC remain reference-based in this module. Future role policies must be
least-privilege, environment-scoped, and reviewed before account-backed use.
Administrator policies, broad principals, wildcard defaults, long-lived access
keys, copied kubeconfigs, bearer tokens, personal AWS profiles, real account IDs,
and SSO URLs must not be committed.

## Outputs

The module exposes non-secret handoff references for future GitOps deployment
work: cluster name, cluster ARN, endpoint reference, OIDC issuer reference,
namespace, node group name, network references, and identity references. The
certificate authority data output is marked sensitive to avoid casual exposure
in generated outputs and logs.
