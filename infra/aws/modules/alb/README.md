# ALB Module

This module defines the FlagForge AWS ALB ingress contract target. It is a
static, reviewable infrastructure contract for future Level 3 AWS deployment
work, not a default account-backed plan or apply workflow.

## Resources

- one Application Load Balancer;
- one HTTP listener with a fixed `404` response until future deployment work
  attaches workload routing;
- one target group shaped for future EKS workload registration.

The module does not create VPCs, subnets, route tables, NAT gateways, internet
gateways, security groups, Route 53 records, ACM certificates, WAF, CloudFront,
ExternalDNS, cert-manager, Kubernetes Ingress objects, Helm values, or Argo CD
applications.

## Contract Assumptions

- exposure mode is explicit and defaults to `internet-facing` for the first
  non-production `dev` learning target;
- `internal` remains a future environment choice for private targets;
- the first listener is HTTP on port `80`; TLS, certificates, DNS, WAF, and
  production edge hardening are future reviewed changes;
- future workload traffic is expected on port `3000` with `/readyz` health
  checks;
- the future ingress class is `alb` and the expected controller path is AWS Load
  Balancer Controller.

## External Dependencies

Future account-backed workflows must replace committed mock references with
reviewed outputs for:

- VPC ID;
- public subnet IDs for internet-facing ALBs or private subnet IDs for internal
  ALBs;
- ALB security group IDs.

Mock values in the live `dev` composition are non-sensitive static-validation
placeholders only and are invalid for real plan or apply.

## Outputs

The module exposes non-secret handoff references for future GitOps deployment
work: load balancer ARN, DNS name, zone ID, listener ARN, target group ARN,
ingress class, controller name, exposure mode, listener expectations, health
check path, and network references.
