## ADDED Requirements

### Requirement: Represent AWS EKS and ALB in IaC

FlagForge SHALL provide a source-controlled AWS EKS and ALB runtime target through the selected OpenTofu and Terragrunt IaC workflow.

#### Scenario: EKS and ALB target lives in AWS infrastructure

- **WHEN** a contributor inspects the repository
- **THEN** EKS and ALB IaC exists in an infrastructure-oriented path such as `infra/aws/`
- **AND** the EKS and ALB IaC is not embedded in application runtime source under `src/`

#### Scenario: Module and live composition are separated

- **WHEN** a contributor inspects the EKS and ALB IaC
- **THEN** reusable OpenTofu module code is separated from Terragrunt live environment composition
- **AND** the live composition identifies the first target as a non-production AWS learning environment
- **AND** the live composition is documented as a static contract target rather than an account-backed plan or apply target until future networking, account, and remote-state changes provide real dependencies

#### Scenario: First target conventions are explicit

- **WHEN** a contributor reads the EKS and ALB documentation or live composition
- **THEN** the first environment is identified as `dev`
- **AND** the first AWS region is identified as `us-east-1`
- **AND** placeholder values avoid real AWS account IDs, profile names, SSO URLs, personal data, customer data, secrets, and production-only identifiers

### Requirement: Define the EKS cluster runtime contract

FlagForge SHALL define the AWS EKS cluster contract needed by future Kubernetes deployment work.

#### Scenario: EKS cluster settings are reviewable

- **WHEN** a contributor inspects the EKS module or documentation
- **THEN** cluster name, Kubernetes version, endpoint access assumptions, node capacity model, add-on assumptions, and baseline tags are documented or represented as inputs
- **AND** the first target is documented as learning-focused rather than production-ready

#### Scenario: Cluster access handoff is non-secret

- **WHEN** future deployment or GitOps work needs to identify the cluster
- **THEN** the EKS contract exposes or documents non-secret references such as cluster name, region, endpoint reference, certificate authority reference, OIDC provider reference, and Kubernetes namespace assumptions
- **AND** kubeconfig files, bearer tokens, personal credentials, and copied cluster access artifacts are not committed

#### Scenario: Workload deployment remains out of scope

- **WHEN** this change is implemented
- **THEN** FlagForge is not deployed to EKS by default
- **AND** Helm chart values, Argo CD application definitions, image tag selection, database secret materialization, and production rollout remain future deployment concerns unless explicitly updated by this change

### Requirement: Define the ALB ingress path contract

FlagForge SHALL define AWS ALB as the Level 3 ingress path for future EKS workloads.

#### Scenario: ALB ingress assumptions are documented

- **WHEN** a contributor reads the EKS and ALB documentation or reviews the IaC
- **THEN** the ALB path identifies exposure mode as an explicit environment setting
- **AND** the first `dev` target defaults to an internet-facing ALB for non-production learning and inspection
- **AND** the documentation states that internal-only exposure remains a future environment choice
- **AND** it documents ingress class or controller assumptions
- **AND** it identifies required subnet and security group references for future account-backed use

#### Scenario: Future deployment consumers have a stable ingress handoff

- **WHEN** future Helm or Argo CD deployment work needs AWS ingress references
- **THEN** it can consume documented handoff values such as ingress class, exposure mode, load balancer endpoint reference, listener or port expectations, subnet references, and security group references without redefining the ALB contract

#### Scenario: Production edge features remain explicit future work

- **WHEN** a contributor reads the EKS and ALB documentation
- **THEN** Route 53, ACM certificates, WAF, CloudFront, ExternalDNS, cert-manager, production DNS ownership, production edge hardening, and production traffic rollout are identified as out of scope unless a future OpenSpec change introduces them

### Requirement: Consume external network dependencies

FlagForge SHALL keep AWS network dependencies explicit for the EKS and ALB runtime target.

#### Scenario: Network baseline is not hidden inside this runtime target

- **WHEN** a contributor inspects the EKS and ALB module and live composition
- **THEN** VPC, subnet, route table, NAT gateway, internet gateway, and shared security group resources are not silently created as an unreviewed networking baseline
- **AND** required network dependencies are represented as inputs, references, documented future outputs, or clearly marked non-sensitive mock outputs for static validation only

#### Scenario: Mock network outputs are not plan or apply inputs

- **WHEN** mock network values are present for static validation
- **THEN** they are documented as invalid for real account-backed plan or apply workflows
- **AND** future account-backed workflows are required to replace them with reviewed network outputs

### Requirement: Document EKS and ALB identity and access guardrails

FlagForge SHALL document least-privilege identity, access, and generated artifact assumptions for the EKS and ALB runtime target.

#### Scenario: IAM and controller identity assumptions are explicit

- **WHEN** a contributor reads the EKS and ALB documentation or reviews the IaC
- **THEN** cluster role, node role, OIDC provider, ALB controller role, and service account or pod identity assumptions are represented as scoped references or documented inputs
- **AND** administrator policies, broad principals, wildcard defaults, long-lived access keys, shared personal credentials, and committed kubeconfigs are not presented as defaults

#### Scenario: Sensitive generated artifacts stay out of source control

- **WHEN** a contributor inspects source-controlled EKS and ALB files
- **THEN** OpenTofu and Terragrunt state files, plan files, command logs, generated provider files, generated module caches, kubeconfigs, cluster tokens, real `.tfvars` values, and sensitive outputs are not committed

#### Scenario: Security review gates are documented

- **WHEN** a contributor reads EKS and ALB planning or implementation documentation
- **THEN** it identifies Staff, SRE, Security/LGPD, and QA review expectations for cloud runtime architecture, identity, access, networking, generated artifacts, validation strategy, and cost exposure

### Requirement: Preserve application behavior

FlagForge SHALL keep the EKS and ALB runtime target compatible with the existing application behavior and platform contracts.

#### Scenario: Application behavior remains unchanged

- **WHEN** this change is implemented
- **THEN** public API behavior, domain behavior, flag evaluation, audit-log behavior, database schema, and OpenAPI contracts remain unchanged
- **AND** AWS-specific cluster and ingress configuration stays outside application domain logic

#### Scenario: Existing platform handoffs remain authoritative

- **WHEN** future deployment work consumes AWS runtime references
- **THEN** it uses the existing ECR image publishing contract for image repository and tag shape
- **AND** it uses the existing RDS PostgreSQL contract for database endpoint and secret references
- **AND** it uses the existing Helm packaging and Argo CD decisions unless a future OpenSpec change modifies them

### Requirement: Document EKS and ALB cost and operations expectations

FlagForge SHALL document cost drivers, operational assumptions, and cleanup or rollback expectations for the AWS EKS and ALB runtime target.

#### Scenario: Cost assumptions are explicit

- **WHEN** a contributor reads the EKS and ALB documentation
- **THEN** it identifies expected cost drivers such as EKS control plane hours, node capacity, NAT and data transfer, ALB hours and LCUs, CloudWatch logs, storage, public IPv4, and add-on costs
- **AND** it describes the first target as development-sized or learning-focused unless a future reviewed change makes it production-oriented

#### Scenario: Operational settings are documented

- **WHEN** a contributor reads the EKS and ALB documentation or reviews the IaC
- **THEN** Kubernetes version, node capacity, add-on assumptions, endpoint access, logging, tagging, ingress exposure, and controller assumptions are documented or explicitly deferred with rationale

#### Scenario: Rollback and cleanup are documented

- **WHEN** a contributor reads the EKS and ALB runbook or implementation documentation
- **THEN** it distinguishes code rollback, planned resource cleanup, state recovery, cluster access recovery, ingress traffic rollback, and data-preserving remediation for dependent services
- **AND** it does not imply that code rollback alone removes live EKS, ALB, IAM, networking, or generated access artifacts

### Requirement: Keep validation and provisioning workflows separate

FlagForge SHALL keep static validation, account-backed planning, provisioning, and cluster access workflows operationally separate for the AWS EKS and ALB runtime target.

#### Scenario: Default verification does not require AWS or cluster access

- **WHEN** a contributor runs the repository default verification gate
- **THEN** it does not require AWS credentials, remote state, a live EKS cluster, an ALB, kubeconfig access, account-backed plans, or cloud provisioning

#### Scenario: Static validation is documented separately

- **WHEN** a contributor reads the EKS and ALB documentation
- **THEN** it identifies any OpenTofu or Terragrunt formatting and static validation commands separately from default repository verification
- **AND** it explains that missing local IaC CLIs are local prerequisite issues, not reasons to add cloud credentials

#### Scenario: Account-backed and cluster access commands are explicit

- **WHEN** a contributor inspects package scripts, Makefile targets, CI workflows, runbooks, and EKS and ALB documentation
- **THEN** default commands do not run `tofu plan`, `terragrunt plan`, `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `terragrunt run-all apply`, `terragrunt run-all destroy`, `tofu import`, `tofu state rm`, `tofu force-unlock`, `tofu taint`, kubeconfig generation, cluster-admin access, or equivalent account-backed, destructive, state-mutating, or live-cluster commands
- **AND** any future use of those commands is documented as explicit human-reviewed workflow rather than automatic verification
