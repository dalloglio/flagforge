# 0013 - Use OpenTelemetry, Prometheus, and Grafana for Observability

## Status

Accepted

## Context

Future platform work needs an observability direction that supports local learning and production-style thinking.

## Decision

Use OpenTelemetry for instrumentation direction and Prometheus plus Grafana for local metrics and dashboards.

## Rationale

OpenTelemetry is vendor-neutral, while Prometheus and Grafana are practical local tools for metrics and visualization.

## Consequences

- Observability implementation is future work.
- API code should not gain telemetry concerns before an active change requests them.
- Future instrumentation should preserve domain/API boundaries.
- Datadog remains optional for later comparison if useful.

## Alternatives considered

- Logs only: simpler, but too limited for observability practice.
- Vendor-first observability: realistic, but less suitable for low-cost local learning.

## Follow-up changes

- Add instrumentation and local observability stack through dedicated changes.
