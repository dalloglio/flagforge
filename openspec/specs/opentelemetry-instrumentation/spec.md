## Purpose

Define the accepted OpenTelemetry runtime instrumentation behavior for the
FlagForge API.

## Requirements

### Requirement: Configurable API runtime instrumentation

The system SHALL provide configurable OpenTelemetry instrumentation for the FlagForge API runtime.

#### Scenario: Instrumentation is disabled by default

- **WHEN** the API starts without OpenTelemetry being explicitly enabled
- **THEN** the API starts without requiring an OpenTelemetry Collector, tracing backend, Datadog, AWS, EKS, Kubernetes, or vendor-managed monitoring service
- **AND** existing API behavior, startup PostgreSQL validation, health/readiness behavior, Prometheus metrics behavior, feature flag behavior, evaluation behavior, audit-log behavior, admin authentication behavior, and rate-limit behavior remain unchanged

#### Scenario: Instrumentation can be enabled locally

- **WHEN** a contributor starts the API with documented OpenTelemetry local configuration
- **THEN** the API initializes OpenTelemetry instrumentation for the runtime before serving HTTP requests
- **AND** the configured local export path receives telemetry signals for served HTTP requests

#### Scenario: Instrumentation can be disabled explicitly

- **WHEN** a contributor starts the API with documented configuration that disables OpenTelemetry instrumentation
- **THEN** the API does not initialize OpenTelemetry exporters or HTTP instrumentation
- **AND** the API continues to serve existing routes using the same request and response behavior

### Requirement: HTTP trace signal safety

The system SHALL record OpenTelemetry HTTP runtime traces using low-cardinality and non-sensitive attributes.

#### Scenario: HTTP request spans use stable route information

- **WHEN** the API serves an HTTP request for a known route
- **THEN** emitted OpenTelemetry HTTP span data uses stable route or route-template information rather than raw request URLs or path parameter values
- **AND** span data may include low-cardinality HTTP method and response status information

#### Scenario: Unmatched and malformed requests use safe fallback information

- **WHEN** the API serves an unmatched route or malformed request
- **THEN** emitted OpenTelemetry HTTP span data uses stable fallback route information
- **AND** span data does not include raw URLs, query strings, path parameter values, or request bodies

#### Scenario: Telemetry does not leak sensitive or high-cardinality input

- **WHEN** requests include path parameters, query strings, request bodies, feature flag evaluation context values, database URLs, API keys, credentials, or secret values
- **THEN** all emitted OpenTelemetry span attributes, including attributes produced by default HTTP or Express instrumentation, do not include raw path parameter values, query strings, request bodies, feature flag context values, database URLs, API keys, credentials, or secret values

### Requirement: Architecture boundary preservation

The system SHALL keep OpenTelemetry and instrumentation mechanics outside feature flag domain and application modules, and outside API route/use-case modules except for startup wiring.

#### Scenario: Domain, application, and API route modules do not import telemetry packages

- **WHEN** a contributor inspects source files under `src/domain/`, `src/application/`, and API route/use-case modules under `src/api/`
- **THEN** those files do not import OpenTelemetry packages, Express instrumentation packages, Prometheus, Grafana, collector configuration, Kubernetes configuration, cloud infrastructure modules, or vendor telemetry SDKs
- **AND** OpenTelemetry imports are limited to the dedicated infrastructure telemetry module and startup wiring

#### Scenario: Domain behavior remains independent from instrumentation

- **WHEN** OpenTelemetry instrumentation is enabled, disabled, or unconfigured
- **THEN** feature flag creation, update, listing, reading, evaluation, and audit-log behavior remain governed by the existing application and domain rules
- **AND** telemetry configuration does not alter domain validation or evaluation results

### Requirement: Existing observability and API contracts remain stable

The system SHALL add OpenTelemetry runtime instrumentation without changing existing public API or Prometheus metrics contracts.

#### Scenario: Public API contract does not change

- **WHEN** OpenTelemetry instrumentation is added
- **THEN** no public HTTP endpoint is added, removed, renamed, or changed by the instrumentation work
- **AND** `docs/api/openapi.yaml` remains unchanged unless a separate explicit public API behavior change is introduced

#### Scenario: Prometheus metrics endpoint remains unchanged

- **WHEN** OpenTelemetry instrumentation is enabled, disabled, or unconfigured
- **THEN** `GET /metrics` remains a Prometheus-compatible operational scrape endpoint
- **AND** the existing local Prometheus and Grafana workflow does not require OpenTelemetry, an OpenTelemetry Collector, Datadog, AWS, EKS, Kubernetes, or a production tracing backend

### Requirement: Local OpenTelemetry documentation

The repository SHALL document how contributors configure, enable, disable, validate, and troubleshoot local OpenTelemetry instrumentation.

#### Scenario: Local configuration is documented

- **WHEN** a contributor reads the local development documentation
- **THEN** it explains the supported OpenTelemetry configuration values
- **AND** it identifies which configuration enables instrumentation, disables instrumentation, and selects the local validation export path

#### Scenario: Local validation is documented

- **WHEN** a contributor follows the documented local OpenTelemetry validation workflow
- **THEN** they can generate API traffic and confirm that OpenTelemetry HTTP runtime signals are emitted without running an OpenTelemetry Collector, Datadog, AWS, EKS, Kubernetes, or a production tracing backend

#### Scenario: Troubleshooting guidance is documented

- **WHEN** a contributor reads the local OpenTelemetry troubleshooting guidance
- **THEN** it explains how to diagnose missing signals, disabled instrumentation, unsupported export configuration, startup issues, and unsafe assumptions about collectors or vendor backends

### Requirement: Verification coverage

The system SHALL include validation for OpenTelemetry instrumentation behavior and boundary constraints.

#### Scenario: Automated checks cover instrumentation behavior

- **WHEN** the project test suite runs
- **THEN** automated tests or equivalent checks cover disabled instrumentation behavior, enabled local instrumentation behavior, and safe HTTP telemetry attributes

#### Scenario: Automated checks cover domain boundary constraints

- **WHEN** the project verification checks run
- **THEN** automated tests or equivalent checks fail if domain, application, or API route/use-case modules import OpenTelemetry packages or instrumentation mechanics

#### Scenario: Non-automated validation is explicit

- **WHEN** a validation step cannot be automated without adding out-of-scope infrastructure
- **THEN** the repository documents the manual validation command or check required for contributors
