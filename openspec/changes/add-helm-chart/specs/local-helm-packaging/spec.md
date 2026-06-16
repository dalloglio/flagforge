## ADDED Requirements

### Requirement: API Helm chart

FlagForge SHALL provide a Helm chart that renders Kubernetes manifests for deploying the API runtime in the Level 1 local platform path.

#### Scenario: Chart files are present

- **WHEN** a contributor inspects the repository
- **THEN** a Helm chart for the FlagForge API exists under a documented chart directory
- **AND** the chart includes chart metadata, default values, templates, and a local values file

#### Scenario: Chart renders API workload

- **WHEN** a contributor runs the documented Helm template command from the repository root
- **THEN** Helm renders Kubernetes manifests for the FlagForge API workload without requiring Argo CD, Kong, AWS, EKS, or a running Kubernetes cluster

#### Scenario: Chart does not package out-of-scope platform components

- **WHEN** the chart renders manifests with default or local values
- **THEN** the rendered manifests do not install Argo CD, Kong, PostgreSQL, Prometheus, Grafana, OpenTelemetry collectors, or AWS-specific infrastructure

### Requirement: Configurable API runtime values

The Helm chart SHALL expose values for configuring the existing FlagForge API container runtime.

#### Scenario: Image and ports are configurable

- **WHEN** a contributor reviews the chart values
- **THEN** the values allow configuration of the API image repository, tag, pull policy, replica count, container port, service port, and service type

#### Scenario: Runtime environment is configurable

- **WHEN** a contributor reviews the chart values
- **THEN** the values allow configuration of `DATABASE_URL`, `ADMIN_API_KEY`, `ADMIN_RATE_LIMIT_REQUESTS`, and `ADMIN_RATE_LIMIT_WINDOW_MS`
- **AND** local defaults are clearly non-secret development values when provided

#### Scenario: Configuration renders into workload environment

- **WHEN** Helm renders the chart with local values
- **THEN** the API workload receives the configured runtime environment variables needed for startup

### Requirement: Operational probes

The Helm chart SHALL configure Kubernetes probes using the implemented FlagForge operational endpoints.

#### Scenario: Liveness probe uses process liveness endpoint

- **WHEN** Helm renders the chart with default or local values
- **THEN** the API workload liveness probe targets the configured API port and `GET /healthz` by default

#### Scenario: Readiness probe uses dependency readiness endpoint

- **WHEN** Helm renders the chart with default or local values
- **THEN** the API workload readiness probe targets the configured API port and `GET /readyz` by default

#### Scenario: Probe settings are configurable

- **WHEN** a contributor reviews the chart values
- **THEN** the probe paths and timing settings are configurable without editing Kubernetes templates

### Requirement: Local Helm values and documentation

FlagForge SHALL document how to render, lint, and use the API Helm chart for local platform preparation.

#### Scenario: Local values are documented

- **WHEN** a contributor reads the README or local development runbook
- **THEN** it identifies the local Helm values file and explains that it targets the Level 1 local platform path

#### Scenario: Helm validation is documented

- **WHEN** a contributor reads the README or local development runbook
- **THEN** it provides commands for linting the chart and rendering manifests locally
- **AND** it identifies Helm CLI availability as a prerequisite for those chart validation commands

#### Scenario: Host-only verification remains unchanged

- **WHEN** a contributor reads the local verification documentation
- **THEN** Helm chart validation is presented as an explicit platform packaging check
- **AND** it is not described as part of the host-only `npm run verify` completion gate
