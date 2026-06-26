## ADDED Requirements

### Requirement: Local kind cluster configuration

FlagForge SHALL provide a reproducible kind configuration for Level 1 local Kubernetes practice.

#### Scenario: Kind configuration is source controlled

- **WHEN** a contributor inspects the repository
- **THEN** kind configuration exists in an infrastructure-oriented path such as `infra/kind/`
- **AND** the configuration is not embedded in application source under `src/`

#### Scenario: Cluster can be created from repository commands

- **WHEN** a contributor follows the documented local kind setup workflow from the repository root
- **THEN** a named local kind cluster can be created using source-controlled configuration
- **AND** the workflow identifies Docker, kind, kubectl, and Helm as prerequisites

#### Scenario: Workflow wrappers remain thin

- **WHEN** a contributor inspects the local kind workflow commands
- **THEN** Makefile targets or documented commands call kind, kubectl, and Helm directly around source-controlled configuration
- **AND** cluster lifecycle behavior is not hidden behind opaque orchestration scripts

### Requirement: FlagForge runs in local kind

FlagForge SHALL document and support running the API in the local kind cluster using the local platform packaging path.

#### Scenario: API deploys through Helm

- **WHEN** a contributor follows the documented kind deployment workflow
- **THEN** the FlagForge API workload is deployed to kind using the local Helm chart
- **AND** the workflow does not require Argo CD, Kong, Prometheus, Grafana, AWS, or EKS
- **AND** the workflow does not add raw API workload manifests that duplicate the local Helm packaging capability

#### Scenario: PostgreSQL runs inside kind

- **WHEN** a contributor follows the documented kind deployment workflow
- **THEN** PostgreSQL runs inside the local kind cluster with documented non-secret local credentials or documented local secret creation steps
- **AND** the API `DATABASE_URL` points at the in-cluster PostgreSQL service
- **AND** the workflow documents how migrations are applied before readiness smoke validation

#### Scenario: Runtime configuration uses local-safe values

- **WHEN** the local kind deployment renders runtime configuration
- **THEN** required FlagForge runtime settings use documented non-secret local defaults or documented local secret creation steps
- **AND** committed files do not contain production secrets

#### Scenario: Application source remains independent from Kubernetes

- **WHEN** a contributor inspects runtime application source under `src/`
- **THEN** it does not import Kubernetes packages, shell out to Kubernetes CLIs, or branch on kind-specific runtime behavior

### Requirement: Local kind smoke validation

FlagForge SHALL provide a basic smoke validation path for the local kind workflow.

#### Scenario: Smoke check validates API reachability

- **WHEN** the local kind cluster is running and FlagForge has been deployed
- **THEN** the documented smoke check proves a FlagForge operational endpoint such as `GET /healthz` or `GET /readyz` is reachable through the documented local access path after PostgreSQL and migrations are ready
- **AND** the smoke check fails when the API is not reachable

#### Scenario: Kind smoke validation remains outside verify

- **WHEN** a contributor inspects the verification scripts
- **THEN** `npm run verify` does not require Docker, kind, kubectl, Helm, PostgreSQL services, or a running Kubernetes cluster
- **AND** kind validation is available through separate documented commands or Makefile targets

### Requirement: Local kind operations documentation

FlagForge SHALL document setup, reset, limitations, and troubleshooting for the local kind workflow.

#### Scenario: Setup and reset documentation exists

- **WHEN** a contributor reads the local platform documentation
- **THEN** it explains how to create the kind cluster, deploy FlagForge, run the smoke check, and delete or reset the cluster

#### Scenario: Level 1 scope limits are documented

- **WHEN** a contributor reads the local kind documentation
- **THEN** it prominently states that kind is a Level 1 local simulation environment
- **AND** it states that the workflow is not production Kubernetes, AWS, or EKS
- **AND** it does not present kind readiness as proof of production Kubernetes readiness

#### Scenario: Troubleshooting guidance exists

- **WHEN** a contributor reads the local kind documentation
- **THEN** it includes troubleshooting guidance for common local failures such as missing CLIs, Docker not running, cluster creation failure, image availability, PostgreSQL readiness, migration failure, and API readiness failure
