# 0005 - Use PostgreSQL for Persistence

## Status

Accepted

## Context

The current MVP uses in-memory repositories. Earlier notes considered SQLite as a possible next step, but the consolidated direction is to simulate a production-like stack.

## Decision

Use PostgreSQL as the accepted future persistence target instead of SQLite.

## Rationale

PostgreSQL is closer to production systems and aligns with the future local platform and AWS target architecture.

## Consequences

- The next persistence change should be `add-postgresql-persistence`.
- Docker Compose should introduce PostgreSQL first.
- Later local platform work should run PostgreSQL in kind.
- AWS target architecture should use RDS PostgreSQL.
- Integration tests should use a real PostgreSQL-compatible path when persistence is implemented.
- Migrations become part of the persistence harness.

## Alternatives considered

- SQLite: lower setup cost, but less aligned with the platform learning goals.
- Keep only in-memory storage: fastest for API learning, but insufficient for persistence and operations practice.

## Follow-up changes

- Add PostgreSQL persistence through a dedicated OpenSpec change.
