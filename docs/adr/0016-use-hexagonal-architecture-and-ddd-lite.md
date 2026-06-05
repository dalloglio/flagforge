# 0016 - Use Hexagonal Architecture and DDD-Lite

## Status

Accepted

## Context

FlagForge needs clear boundaries as it evolves from an in-memory API into persistence and platform concerns.

## Decision

Use pragmatic hexagonal architecture and DDD-lite.

## Rationale

This approach keeps domain behavior independent from HTTP, storage, telemetry, gateway, and infrastructure while avoiding excessive ceremony.

## Consequences

- Domain code does not know Express, PostgreSQL, Kong, OpenTelemetry, Kubernetes, or AWS.
- API code translates HTTP into application/domain operations.
- Infrastructure implements adapters when needed.
- KISS and YAGNI take priority over abstractions without a real boundary.

## Alternatives considered

- Layer everything formally from the start: structured, but too ceremonial for the current scope.
- Keep all logic in route handlers: fast initially, but harder to test and evolve.

## Follow-up changes

- Preserve boundaries when adding PostgreSQL persistence and observability.
