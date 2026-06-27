## Purpose

Define the local Prometheus and Grafana observability setup for FlagForge contributors.

## Requirements

### Requirement: Local Prometheus scrape configuration

FlagForge SHALL provide Docker Compose local Prometheus configuration for scraping the existing FlagForge metrics endpoint.

#### Scenario: Prometheus configuration is source controlled

- **WHEN** a contributor inspects the repository
- **THEN** local Prometheus configuration exists in an infrastructure-oriented path
- **AND** the configuration is not embedded in application source under `src/`

#### Scenario: Prometheus scrapes FlagForge metrics

- **WHEN** the local observability stack and FlagForge API are running
- **THEN** Prometheus scrapes the existing FlagForge `GET /metrics` endpoint through the documented local target
- **AND** the scrape configuration does not require kind, Kubernetes, AWS, EKS, Datadog, OpenTelemetry Collector, or production monitoring services

#### Scenario: Prometheus scope is documented

- **WHEN** a contributor reads the local observability documentation
- **THEN** it identifies the Docker Compose local scrape target, expected service prerequisites, and how to inspect target health in Prometheus

### Requirement: Local Grafana dashboard

FlagForge SHALL provide a Docker Compose local Grafana setup that can visualize basic FlagForge operational metrics.

#### Scenario: Grafana setup is reproducible

- **WHEN** a contributor follows the local observability workflow
- **THEN** Grafana can be started or accessed with documented local configuration
- **AND** the workflow identifies how Grafana connects to the local Prometheus datasource
- **AND** the datasource configuration is source controlled

#### Scenario: Basic FlagForge dashboard is provisioned from source

- **WHEN** a contributor inspects the repository
- **THEN** a source-controlled basic FlagForge dashboard definition exists in an infrastructure-oriented path
- **AND** Grafana provisioning can load the dashboard without requiring manual dashboard creation

#### Scenario: Basic FlagForge dashboard is available

- **WHEN** Grafana is connected to local Prometheus after FlagForge metrics have been scraped
- **THEN** a basic FlagForge dashboard is available
- **AND** the dashboard visualizes at least one request metric or runtime metric exposed by the existing `/metrics` endpoint

#### Scenario: Dashboard scope is local

- **WHEN** a contributor reads the local dashboard documentation
- **THEN** it states that the dashboard is for Level 1 local observability practice
- **AND** it does not claim production SLOs, alerting coverage, OpenTelemetry Collector coverage, AWS observability, or vendor-managed monitoring support

### Requirement: Local observability validation

FlagForge SHALL document a validation path for the local Prometheus and Grafana stack.

#### Scenario: Prometheus validation proves scrape success

- **WHEN** the local observability stack and FlagForge API are running
- **THEN** the documented validation path proves Prometheus can see the FlagForge scrape target as available or exposes actionable target failure details

#### Scenario: Grafana validation proves dashboard access

- **WHEN** Prometheus has scraped FlagForge metrics and Grafana is running
- **THEN** the documented validation path proves the provisioned basic FlagForge dashboard can be opened locally

#### Scenario: Observability validation remains outside verify

- **WHEN** a contributor inspects the verification scripts
- **THEN** `npm run verify` does not require Prometheus, Grafana, Docker, Docker Compose, Kubernetes, PostgreSQL services, or running observability services
- **AND** local observability validation is available through separate documented commands or Makefile targets

### Requirement: Local observability operations documentation

FlagForge SHALL document how to run, reset, and troubleshoot the local observability stack.

#### Scenario: Startup and cleanup documentation exists

- **WHEN** a contributor reads the local observability documentation
- **THEN** it explains how to start Prometheus and Grafana, validate scraping and dashboard access, and stop or reset the local stack

#### Scenario: Troubleshooting guidance exists

- **WHEN** a contributor reads the local observability documentation
- **THEN** it includes troubleshooting guidance for missing metrics, unavailable scrape targets, Grafana datasource failures, dashboard provisioning failures, and local port conflicts

#### Scenario: Vendor-neutral scope is documented

- **WHEN** a contributor reads the local observability documentation
- **THEN** it states that the local setup uses Prometheus and Grafana only
- **AND** it does not introduce Datadog or other vendor-specific monitoring dependencies
