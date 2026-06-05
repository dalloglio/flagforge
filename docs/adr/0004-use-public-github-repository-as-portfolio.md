# 0004 - Use Public GitHub Repository as Portfolio

## Status

Accepted

## Context

FlagForge is both a learning project and a demonstration of engineering process, architecture decisions, testing, and platform evolution.

## Decision

Keep the repository suitable for public portfolio review.

## Rationale

A public repository makes decisions, specs, tests, and delivery artifacts visible. It also forces clearer documentation and safer handling of secrets and operational claims.

## Consequences

- Documentation should be clear to external readers.
- README content must not claim unimplemented capabilities.
- No secrets, local credentials, or private-company assumptions should be committed.
- Workflow artifacts should show disciplined delivery without excessive ceremony.

## Alternatives considered

- Private repository: easier to iterate informally, but weaker as portfolio evidence.
- Public code without process artifacts: simpler, but less useful for demonstrating delivery maturity.

## Follow-up changes

- Keep README and docs honest as platform capabilities are added.
