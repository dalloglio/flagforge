# 0006 - Use Level 1 Local Platform Before Cloud

## Status

Accepted

## Context

The project needs to practice platform delivery without incurring cloud cost or jumping directly to production infrastructure.

## Decision

Build a Level 1 local platform before cloud implementation.

## Rationale

A local platform lets the project practice packaging, GitOps, gateway, database, observability, and operational workflows at low cost.

## Consequences

- kind, Helm, Argo CD, Kong, PostgreSQL, Prometheus, Grafana, and OpenTelemetry are local platform targets.
- The local platform simulates operations but is not production.
- Cloud work waits until the local workflow is mature.

## Alternatives considered

- Implement AWS first: realistic, but higher cost and more moving parts.
- Stay with only Node.js local dev: simpler, but misses platform learning goals.

## Follow-up changes

- Add local platform changes after PostgreSQL persistence.
