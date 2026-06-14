## Purpose

Define operational liveness, readiness, and metrics behavior for local observability of the FlagForge API.

## Requirements

### Requirement: Process liveness endpoint

The system SHALL expose a canonical process liveness endpoint that reports the API process can serve HTTP requests without checking downstream dependencies.

#### Scenario: Liveness succeeds while process is serving

- **WHEN** a client sends `GET /healthz` to a running API process
- **THEN** the system responds with HTTP 200 and a JSON body containing `status` equal to `ok`

#### Scenario: Liveness does not depend on PostgreSQL readiness

- **WHEN** PostgreSQL readiness becomes unavailable after the API process is already serving HTTP requests
- **THEN** `GET /healthz` still responds with HTTP 200 and `status` equal to `ok`

#### Scenario: Legacy health endpoint remains unchanged

- **WHEN** a client sends `GET /health`
- **THEN** the system responds with HTTP 200 and the existing JSON body containing `status` equal to `ok`

### Requirement: Dependency readiness endpoint

The system SHALL expose a dependency readiness endpoint that reports whether dependencies required to serve feature flag traffic are available.

#### Scenario: Readiness succeeds when PostgreSQL is available

- **WHEN** a client sends `GET /readyz` and PostgreSQL readiness succeeds
- **THEN** the system responds with HTTP 200
- **AND** the response body is:
  ```json
  {
    "status": "ready",
    "dependencies": {
      "postgresql": {
        "status": "available"
      }
    }
  }
  ```

#### Scenario: Readiness fails when PostgreSQL is unavailable

- **WHEN** a client sends `GET /readyz` and PostgreSQL readiness fails
- **THEN** the system responds with HTTP 503
- **AND** the response body is:
  ```json
  {
    "status": "not_ready",
    "dependencies": {
      "postgresql": {
        "status": "unavailable"
      }
    }
  }
  ```

#### Scenario: Readiness failure response is sanitized

- **WHEN** PostgreSQL readiness fails because of a connection or query error
- **THEN** the `GET /readyz` response does not include connection strings, credentials, stack traces, SQL driver messages, request bodies, feature flag context values, API keys, or secret values

### Requirement: Prometheus-compatible metrics endpoint

The system SHALL expose Prometheus-compatible operational metrics for local scraping.

#### Scenario: Metrics endpoint exposes Prometheus text

- **WHEN** a client sends `GET /metrics`
- **THEN** the system responds with HTTP 200 and a Prometheus-compatible text response

#### Scenario: Runtime metrics are exposed

- **WHEN** a client reads the `GET /metrics` response
- **THEN** the response includes basic Node.js runtime or process metrics suitable for local Prometheus scraping, such as CPU, memory, event loop, or equivalent default runtime metrics from the selected metrics library

#### Scenario: HTTP request metrics are exposed

- **WHEN** HTTP requests are served before a client reads `GET /metrics`
- **THEN** the metrics response includes an HTTP request count metric
- **AND** the metrics response includes an HTTP request duration metric
- **AND** those metrics use only low-cardinality labels such as HTTP method, route template, and status code or status class

#### Scenario: Malformed JSON responses are counted

- **WHEN** a client sends malformed JSON to an endpoint that accepts a JSON request body
- **THEN** the system responds with HTTP 400
- **AND** a subsequent `GET /metrics` response includes an HTTP request count metric observation for the malformed JSON response
- **AND** the observation uses only low-cardinality labels such as HTTP method, stable route or fallback label, and status code or status class

#### Scenario: Metrics labels do not leak sensitive or high-cardinality values

- **WHEN** the system records HTTP metrics for requests containing path parameters, query strings, request bodies, feature flag evaluation context values, database URLs, API keys, or secrets
- **THEN** the recorded metric labels do not include raw URLs, query strings, path parameter values, request bodies, feature flag context values, database URLs, API keys, or secret values

### Requirement: Operational endpoint documentation

The repository SHALL document local verification steps for the operational endpoints.

#### Scenario: Operational endpoints are documented

- **WHEN** a contributor reads the README or local development runbook
- **THEN** it explains how to call `GET /healthz`, `GET /readyz`, and `GET /metrics` against a locally running API

#### Scenario: Liveness startup semantics are documented

- **WHEN** a contributor reads the README or local development runbook
- **THEN** it explains that `GET /healthz` is available only after the API process has successfully started and is serving HTTP requests
- **AND** it explains that startup PostgreSQL validation remains unchanged

#### Scenario: Metrics documentation is operational

- **WHEN** a contributor reads the operational endpoint documentation
- **THEN** it describes `GET /metrics` as a Prometheus-compatible operational scrape endpoint rather than a feature flag product API endpoint
