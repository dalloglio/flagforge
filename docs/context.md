# Context Map

## Project

FlagForge is a small TypeScript/Express feature flag API used to learn OpenSpec, SDD, CI/CD, platform engineering, harness engineering, and context engineering.

## Focused Context

- `docs/context/product.md`: original intent, delivered product and platform
  scope, non-goals, optional v2 directions, and maintenance state.
- `docs/context/domain-glossary.md`: feature flag domain vocabulary.
- `docs/context/architecture.md`: runtime boundaries, architectural direction, persistence direction, and platform guardrails.
- `docs/context/delivery-workflow.md`: OpenSpec, GitHub, review-role, template, and command-wrapper workflow.
- `docs/project-status.md`: current lifecycle, evidence classification,
  limitations, maintenance rules, and release-readiness record.

## Source of Truth

The chat is an interface, not the source of truth. Durable project knowledge belongs in versioned files:

- `openspec/specs/`: public behavior and quality requirements.
- `openspec/changes/`: proposed behavior changes before implementation.
- `docs/adr/`: durable accepted architecture, platform, tooling, and workflow decisions.
- `docs/context/`: focused context documents.
- `docs/project-status.md`: current roadmap and lifecycle status.
- `docs/templates/`: reusable planning, design, quality, security, operations, and review templates.
- `docs/agent-playbooks/`: role-based review playbooks.
- `docs/decision-log.md`: chronological learning notes and decision history.
- `AGENTS.md`: repository-level instructions for agents working in this tree.

## SDD Rule

Specs are source of truth. Implementation follows specs.

Behavior changes start with OpenSpec. If the public API changes, update the relevant OpenSpec specs with the implementation and tests.

## Harness Rule

The agent must prove changes through tests, typecheck, and OpenSpec validation.

Use focused checks while iterating, but run `npm run verify` before marking implementation work complete. If verification finds unrelated failures, report them instead of doing broad cleanup.

## CI Rule

Pull requests must pass:

- `npm run typecheck`
- `npm test`
- `openspec validate --all --strict`

The local completion gate is stricter and centralized as `npm run verify`, which runs typecheck, lint, format check, tests, OpenAPI validation, and strict OpenSpec validation.

## Commit Rule

Use Conventional Commits for commit messages, such as `feat: add evaluation route`, `fix: validate flag keys`, or `docs: update project guidance`.

## Current Architecture

- Runtime code lives in `src/`.
- `src/server.ts` starts the Express server.
- `src/api/` owns HTTP routing, request validation, dependency wiring, and error mapping.
- `src/application/` owns feature flag and audit-log use case orchestration.
- `src/domain/` owns flag types, Zod schemas, repository contracts, audit event construction, and evaluation logic.
- `src/infrastructure/postgres/` owns PostgreSQL configuration, migrations, adapters, and transaction support.
- `src/infrastructure/telemetry/` owns optional local OpenTelemetry startup and
  HTTP instrumentation.
- Tests live in `test/` and mirror API/domain boundaries.
- Runtime storage uses PostgreSQL.
- In-memory repositories remain explicit test doubles for focused tests.

## Current Behavior Model

FlagForge manages feature flags and evaluates them deterministically from:

- an `enabled` state;
- caller-provided context;
- simple matching rules using the supported operators;
- optional percentage rollout configuration using an integer percentage from `0` through `100` and a context attribute for deterministic bucketing.

Rollout evaluation runs after disabled-state and rule eligibility checks. Rollout-controlled responses use `in_rollout`, `not_in_rollout`, or `missing_rollout_attribute` reasons.

The API also records audit events for successful flag mutations and exposes a read-only audit log.

Administrative endpoints use API-key authentication and local in-process rate
limiting. Operational endpoints expose health, liveness, readiness, and
Prometheus metrics; optional local OpenTelemetry console tracing is disabled by
default.

V1 deliberately excludes tenancy, multiple flag environments, SDKs, segments,
full RBAC, distributed rate limiting, production secret management, and live
cloud operation.

## Agent Rules

- Use OpenSpec before implementing behavior changes.
- Every behavior change needs tests.
- Keep changes small.
- Use Conventional Commits for commit messages.
- Run `npm run verify` before marking work complete.
- PostgreSQL is the implemented runtime persistence path; do not add another
  persistence technology unless an active OpenSpec change requests it.
- Do not change public API behavior without updating OpenSpec specs and `docs/api/openapi.yaml`.
- Keep `docs/project-status.md` and affected README/context summaries aligned
  when maintenance work changes lifecycle state, evidence, limitations, or
  committed scope.

## Context Engineering Rule

When chat reveals durable knowledge, move it into the right repository file. Use:

- OpenSpec specs for required behavior.
- OpenSpec changes for proposed behavior changes.
- ADRs for durable accepted decisions.
- `docs/decision-log.md` for chronological learning notes and historical decision context.
- `docs/context/` for the current operating map, architecture boundaries, delivery workflow, and glossary.
