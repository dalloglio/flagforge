# 0014 - Use GitHub Actions for CI and Quality Gates

## Status

Accepted

## Context

FlagForge already has a local verification harness and needs a CI direction aligned with GitHub-based delivery.

## Decision

Use GitHub Actions for CI and keep `npm run verify` as the local completion gate.

## Rationale

GitHub Actions keeps automation close to GitHub Issues, Projects, and Pull Requests. The existing npm scripts remain the source commands for verification.

## Consequences

- CI should run typecheck, tests, and strict OpenSpec validation.
- Local completion uses `npm run verify`.
- Makefile targets may wrap commands but must not redefine quality gates.
- New CI automation should be added in a dedicated future change.

## Alternatives considered

- External CI service: viable, but unnecessary for this repository.
- Makefile as the primary quality source: convenient, but npm scripts already define the project harness.

## Follow-up changes

- Add or evolve GitHub Actions workflows through dedicated CI changes.
