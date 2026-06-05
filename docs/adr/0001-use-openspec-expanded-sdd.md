# 0001 - Use OpenSpec Expanded SDD

## Status

Accepted

## Context

FlagForge is a learning project where API behavior, platform work, and delivery workflow need to remain explicit and reviewable as the system grows.

## Decision

Use OpenSpec expanded workflow as the specification-driven development mechanism for behavior changes and delivery-foundation changes.

## Rationale

OpenSpec keeps proposal, design, delta specs, and tasks versioned before implementation. It gives Codex, Cursor, contributors, and reviewers a shared source of truth.

## Consequences

- Public behavior changes start with OpenSpec.
- Specs define expected behavior.
- Implementation follows approved artifacts.
- `openspec validate` is a required quality gate.
- Archiving promotes completed changes into the durable spec set.

## Alternatives considered

- Chat-only planning: fast, but not durable or reviewable.
- Direct implementation first: faster for tiny changes, but easier to drift from requirements.
- Conventional design docs only: useful, but weaker for executable spec validation.

## Follow-up changes

- Apply this workflow for the local platform changes.
