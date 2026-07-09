## ADDED Requirements

### Requirement: AWS GitOps desired state

FlagForge SHALL provide source-controlled desired state for deploying the API to
the Level 3 AWS `dev` GitOps target.

#### Scenario: Desired state lives in an AWS GitOps path

- **WHEN** a contributor inspects the repository
- **THEN** the AWS GitOps desired state exists in an infrastructure-oriented path
  such as `infra/aws/gitops/dev/us-east-1/`
- **AND** the desired state is not embedded in application runtime source under
  `src/`
- **AND** the path distinguishes the AWS `dev` target from local Argo CD desired
  state

#### Scenario: First target conventions are explicit

- **WHEN** a contributor reviews the AWS GitOps desired state or documentation
- **THEN** the first target environment is identified as `dev`
- **AND** the first AWS region is identified as `us-east-1`
- **AND** the target is described as non-production Level 3 learning practice
  rather than production readiness for real customer traffic

### Requirement: AWS GitOps consumes existing deployment contracts

FlagForge SHALL make the AWS GitOps target consume existing EKS/ALB, RDS, ECR,
Helm, and Argo CD contracts instead of redefining those foundations.

#### Scenario: Desired state uses Helm packaging

- **WHEN** the AWS Argo CD application definition is reviewed
- **THEN** it points to the existing FlagForge Helm chart
- **AND** it uses AWS-specific values for the AWS `dev` target
- **AND** it does not define a competing raw Kubernetes Deployment, Service,
  ConfigMap, or Secret for the API workload

#### Scenario: Desired state consumes EKS and ALB handoffs

- **WHEN** documentation describes the AWS GitOps deployment target
- **THEN** it references the existing EKS cluster, namespace, ingress class,
  exposure mode, load balancer endpoint, OIDC, and network assumptions as
  prerequisites or handoffs
- **AND** it does not redefine the EKS, ALB, networking, IAM/OIDC, DNS, TLS, or
  production edge contracts

#### Scenario: Desired state consumes RDS handoffs

- **WHEN** documentation describes database configuration for the AWS GitOps
  target
- **THEN** it references the existing RDS endpoint, port, database name, username
  reference, password reference, TLS expectation, and migration expectation as
  prerequisites or handoffs
- **AND** it does not create an AWS-only schema or migration model

#### Scenario: Desired state consumes ECR handoffs

- **WHEN** documentation or desired state shows the deployable image reference
- **THEN** it uses the placeholder URI shape
  `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:<tag>`
- **AND** it identifies commit-addressable tags such as `<yyyymmdd>.<short-sha>`
  as deployable image references
- **AND** it does not rely on mutable-only image tags such as `latest` as the
  only deployable reference

### Requirement: AWS GitOps configuration and secrets are safe to commit

FlagForge SHALL distinguish committed AWS GitOps configuration from external
secret references and account-backed prerequisite values.

#### Scenario: Committed examples avoid sensitive values

- **WHEN** a contributor inspects committed desired state, values, examples,
  documentation, rendered manifests, workflow outputs, or screenshots for the AWS
  GitOps path
- **THEN** they do not contain real AWS account IDs, credentials, kubeconfigs,
  Argo CD credentials, cloud tokens, copied cloud outputs, personal data,
  customer data, production-only identifiers, or live secret values

#### Scenario: Runtime secrets use external references

- **WHEN** AWS GitOps values configure sensitive runtime settings
- **THEN** `DATABASE_URL`, `ADMIN_API_KEY`, database password material, and other
  sensitive inputs are represented as existing Kubernetes Secret, Argo CD, or
  external secret integration references
- **AND** the desired state does not commit plaintext secret values
- **AND** production secret management is documented as a separate reviewed
  concern unless this change explicitly narrows it

#### Scenario: Account-backed prerequisites are explicit

- **WHEN** documentation describes values needed for a live AWS sync
- **THEN** account-backed values such as real ECR registry, cluster access,
  ingress endpoint, database endpoint, secret materialization, and Argo CD access
  are identified as prerequisites
- **AND** placeholders are clearly non-sensitive examples

### Requirement: Promotion workflow

FlagForge SHALL document how a reviewed ECR image becomes the desired image for
the AWS `dev` GitOps target.

#### Scenario: Promotion updates desired state through review

- **WHEN** a contributor promotes a FlagForge API image to the AWS `dev` GitOps
  target
- **THEN** the promotion workflow explains how to update desired state to a
  reviewed commit-addressable image tag
- **AND** it distinguishes pull request validation, merge to the desired-state
  source of truth, and any manual approval or environment protection required
  before Argo CD sync

#### Scenario: Promotion does not change application behavior

- **WHEN** a promotion-only change updates the AWS GitOps desired image or
  deployment configuration
- **THEN** public API behavior, OpenAPI, domain behavior, database schema,
  migrations, and local platform behavior remain unchanged unless a separate
  OpenSpec change explicitly modifies them

### Requirement: Validation boundaries

FlagForge SHALL provide validation expectations for the AWS GitOps path while
keeping default local verification independent from live cloud resources.

#### Scenario: Pull request validation is credential-free

- **WHEN** a contributor validates an AWS GitOps desired-state change in a pull
  request
- **THEN** documented checks cover desired-state syntax, Helm rendering, OpenSpec
  alignment, and repository quality without requiring AWS credentials, remote
  state, kubeconfig access, live EKS, Argo CD, Docker, ECR, RDS, ALB, or cloud
  resources

#### Scenario: Default verify remains host-only

- **WHEN** a contributor runs `npm run verify`
- **THEN** it does not require AWS credentials, remote state, kubeconfig access,
  live EKS, Argo CD, Docker, ECR, RDS, ALB, or cloud resources
- **AND** live sync, live health checks, kubeconfig use, Argo CD CLI use, and
  account-backed validation remain separate explicit workflows

#### Scenario: Live validation checks sync workload and product health

- **WHEN** account-backed EKS and Argo CD access are available and a live AWS sync
  is performed
- **THEN** documented validation uses Argo CD sync status, Argo CD application
  health, Kubernetes rollout status, and a FlagForge operational endpoint such as
  `GET /healthz` or `GET /readyz`
- **AND** product-level ingress validation confirms the API is reachable through
  the AWS ALB path without changing public API semantics

### Requirement: AWS GitOps operations

FlagForge SHALL document operations expectations for sync, drift inspection,
rollback, cleanup, and failed deployment ownership.

#### Scenario: Sync mode is explicit

- **WHEN** a contributor reviews the AWS Argo CD application definition or
  documentation
- **THEN** the first AWS `dev` target identifies whether sync is manual or
  automated
- **AND** any automated sync behavior requires explicit documentation of review,
  environment protection, and rollback expectations

#### Scenario: Drift inspection is documented

- **WHEN** a contributor needs to compare source-controlled AWS GitOps desired
  state with live cluster state
- **THEN** documentation explains how to inspect Argo CD application diff, sync
  status, and Kubernetes resource differences
- **AND** drift inspection commands are separate from default local verification

#### Scenario: Rollback reverts desired state

- **WHEN** a contributor needs to roll back an AWS GitOps deployment
- **THEN** documentation explains how to revert desired state to a prior
  known-good image tag or configuration revision
- **AND** rollback does not depend on mutable-only image tags
- **AND** it distinguishes GitOps desired-state rollback from infrastructure
  cleanup, database rollback, migration rollback, or code rollback

#### Scenario: Cleanup removes or disables the GitOps target

- **WHEN** a contributor needs to remove or disable the AWS GitOps application
  target
- **THEN** documentation explains the cleanup path for the Argo CD application
  target
- **AND** it does not imply that code rollback destroys AWS resources, deletes
  RDS data, removes ECR images, or cleans up infrastructure state

#### Scenario: Failed deployment ownership is documented

- **WHEN** documentation describes AWS GitOps operations
- **THEN** it identifies ownership or escalation for failed sync, unhealthy Argo
  CD application status, failed Kubernetes rollout, unavailable ingress, missing
  image, missing database secret, failed database connectivity, and rejected Argo
  CD access

### Requirement: Review gates

FlagForge SHALL require role-based review before the AWS GitOps deployment path
is implemented.

#### Scenario: Required review gates are visible

- **WHEN** the OpenSpec change is reviewed before implementation
- **THEN** Staff review covers architecture boundaries, dependency handoffs, and
  alignment with accepted AWS, Helm, Argo CD, and CI decisions
- **AND** SRE review covers sync reliability, health checks, drift, rollback,
  cleanup, observability assumptions, and runbooks
- **AND** Security/LGPD review covers secrets, access, repository contents, image
  references, logs, generated artifacts, and metadata exposure
- **AND** QA review covers desired-state validation, promotion, deployment
  health, rollback, and regression boundaries
