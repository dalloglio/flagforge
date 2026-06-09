# Context Map

## Project

FlagForge is a small TypeScript/Express feature flag API used to learn OpenSpec, SDD, CI/CD, platform engineering, harness engineering, and context engineering.

## Focused Context

- `docs/context/product.md`: product intent, audience, current scope, future scope, and non-goals.
- `docs/context/domain-glossary.md`: feature flag domain vocabulary.
- `docs/context/architecture.md`: runtime boundaries, architectural direction, persistence direction, and platform guardrails.
- `docs/context/delivery-workflow.md`: OpenSpec, GitHub, review-role, template, and command-wrapper workflow.

## Source of Truth

The chat is an interface, not the source of truth. Durable project knowledge belongs in versioned files:

- `openspec/specs/`: public behavior and quality requirements.
- `openspec/changes/`: proposed behavior changes before implementation.
- `docs/adr/`: durable accepted architecture, platform, tooling, and workflow decisions.
- `docs/context/`: focused context documents.
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

The local completion gate is stricter and centralized as `npm run verify`, which runs typecheck, lint, format check, tests, and strict OpenSpec validation.

## Commit Rule

Use Conventional Commits for commit messages, such as `feat: add evaluation route`, `fix: validate flag keys`, or `docs: update project guidance`.

## Current Architecture

- Runtime code lives in `src/`.
- `src/server.ts` starts the Express server.
- `src/api/` owns HTTP routing, request validation, dependency wiring, and error mapping.
- `src/application/` owns feature flag and audit-log use case orchestration.
- `src/domain/` owns flag types, Zod schemas, repository contracts, audit event construction, and evaluation logic.
- `src/infrastructure/postgres/` owns PostgreSQL configuration, migrations, adapters, and transaction support.
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

The MVP intentionally avoids persistence, authentication, authorization, tenancy, segments, environments, and SDKs.

## Agent Rules

- Use OpenSpec before implementing behavior changes.
- Every behavior change needs tests.
- Keep changes small.
- Use Conventional Commits for commit messages.
- Run `npm run verify` before marking work complete.
- Do not introduce persistence unless the active OpenSpec change requests it.
- Do not change public API behavior without updating OpenSpec specs.

## Context Engineering Rule

When chat reveals durable knowledge, move it into the right repository file. Use:

- OpenSpec specs for required behavior.
- OpenSpec changes for proposed behavior changes.
- ADRs for durable accepted decisions.
- `docs/decision-log.md` for chronological learning notes and historical decision context.
- `docs/context/` for the current operating map, architecture boundaries, delivery workflow, and glossary.
