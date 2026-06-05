# 0018 - Use Role-Based Review Gates

## Status

Accepted

## Context

FlagForge is used to practice production-like delivery responsibilities, not only coding tasks.

## Decision

Use role-based review gates and playbooks for PM, Product Design, Engineering Manager, Staff Engineer, Developer, QA, Security/LGPD, SRE, and Observability perspectives when applicable.

## Rationale

Role-based review makes intent, architecture, quality, risk, and operations explicit. It also helps simulate handoffs and trade-offs from real delivery workflows.

## Consequences

- Not every role blocks every change.
- Review depth should match the risk and scope.
- Human review gates validate intent, acceptance, risk, and architecture.
- Automated gates validate format, tests, build, specs, and verification.
- Each role should produce a reviewable artifact or decision when invoked.

## Alternatives considered

- Single generic review: simpler, but weaker for learning role responsibilities.
- Make every role mandatory for every change: thorough, but too heavy for small changes.

## Follow-up changes

- Refine which roles block which change types in a future workflow capability if needed.
