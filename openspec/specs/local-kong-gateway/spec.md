## Purpose

Define the local Kong Gateway workflow for routing host traffic to the FlagForge API in Docker Compose while keeping application runtime code independent from Kong.

## Requirements

### Requirement: Local Kong Gateway configuration

FlagForge SHALL provide source-controlled Kong Gateway configuration for local development using DB-less declarative configuration stored outside application source code.

#### Scenario: Kong configuration is source controlled

- **WHEN** a contributor inspects the repository
- **THEN** Kong declarative configuration exists in an infrastructure-oriented path such as `infra/kong/`
- **AND** no Kong configuration is embedded in `src/`

#### Scenario: Kong uses DB-less mode

- **WHEN** the local Kong service starts through Docker Compose
- **THEN** it uses declarative DB-less configuration from the repository
- **AND** it does not require a Kong database

### Requirement: Local Kong proxy routing

FlagForge SHALL provide a local Kong proxy that routes HTTP traffic from the host to the FlagForge API running in the local Docker Compose stack.

#### Scenario: Kong proxies health checks to FlagForge

- **WHEN** the local API and Kong services are running
- **THEN** `GET /health` through the Kong proxy returns the FlagForge health response

#### Scenario: Kong proxies the current API surface

- **WHEN** the local API and Kong services are running
- **THEN** flag management, flag evaluation, audit-log, and operational API requests sent through Kong reach the FlagForge API

#### Scenario: Direct app access remains available

- **WHEN** the local Docker Compose app service is running with Kong enabled
- **THEN** the FlagForge API remains reachable through the documented direct app host port

### Requirement: Local Kong proxy port configuration

FlagForge SHALL expose the local Kong proxy on host port `8000` by default and SHALL allow contributors to override that host port through an environment variable.

#### Scenario: Default proxy port is available

- **WHEN** a contributor starts the local Kong service without overriding the proxy port
- **THEN** the Kong proxy is reachable from the host on port `8000`

#### Scenario: Proxy port can be overridden

- **WHEN** a contributor starts the local Kong service with `KONG_PROXY_PORT` set to a non-default host port
- **THEN** the Kong proxy is reachable from the host through that configured port

### Requirement: Kong Admin API host exposure

FlagForge SHALL NOT expose Kong Admin API on the host by default for the local gateway workflow.

#### Scenario: Admin API is not published by default

- **WHEN** a contributor starts the local Kong service with the default Compose configuration
- **THEN** no Kong Admin API port is published to the host

#### Scenario: Gateway routing does not require Admin API access

- **WHEN** a contributor follows the documented local gateway startup workflow
- **THEN** they can route traffic through Kong without enabling host access to Kong Admin API

### Requirement: Local gateway documentation

FlagForge SHALL document how to run, validate, and troubleshoot the local Kong gateway workflow.

#### Scenario: Startup documentation exists

- **WHEN** a contributor reads the local development documentation
- **THEN** it explains how to start the API and Kong together locally
- **AND** it identifies the default and overrideable Kong proxy port

#### Scenario: Validation documentation exists

- **WHEN** a contributor reads the local development documentation
- **THEN** it explains how to prove traffic reaches FlagForge through Kong
- **AND** it distinguishes gateway smoke validation from direct app validation

#### Scenario: Scope limits are documented

- **WHEN** a contributor reads the local gateway documentation
- **THEN** it states that local Kong does not add authentication, authorization, rate limiting, production hardening, Helm, kind, Argo CD, or cloud deployment

### Requirement: Gateway smoke validation

FlagForge SHALL provide a Docker-only smoke check for local Kong routing and SHALL keep that check outside the host-only `npm run verify` completion gate.

#### Scenario: Gateway smoke check proves API routing

- **WHEN** the local API and Kong services are running
- **THEN** the documented gateway smoke command sends a request through the Kong proxy to a FlagForge endpoint
- **AND** the command fails if the proxied API response is unavailable

#### Scenario: Gateway smoke check remains outside verify

- **WHEN** a contributor inspects the verification scripts
- **THEN** `npm run verify` does not require Docker, Docker Compose, Kong, PostgreSQL, or running services
- **AND** gateway smoke validation is available through a separate documented command or Makefile target

### Requirement: Application independence from Kong

FlagForge application code SHALL remain independent from Kong Gateway.

#### Scenario: Application source has no Kong dependency

- **WHEN** a contributor inspects runtime application source under `src/`
- **THEN** it does not import Kong packages, read Kong-specific configuration, or branch on Kong runtime behavior

#### Scenario: Public API behavior remains unchanged

- **WHEN** requests are sent directly to the FlagForge API instead of through Kong
- **THEN** existing direct API behavior remains unchanged
