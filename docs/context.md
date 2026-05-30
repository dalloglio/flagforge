# Context Map

## Project

FlagForge is a small TypeScript/Express feature flag API used to learn OpenSpec, SDD, CI/CD, harness engineering, and context engineering.

## Current learning goal

Learn OpenSpec through a small production-like API.

## Source of truth

The chat is an interface, not the source of truth. Durable project knowledge belongs in versioned files:

- `openspec/specs/`: public behavior and quality requirements.
- `openspec/changes/`: proposed behavior changes before implementation.
- `docs/context.md`: compact map of current project context and operating rules.
- `docs/decision-log.md`: decisions already made and their consequences.
- `AGENTS.md`: repository-level instructions for agents working in this tree.

## SDD rule

Specs are source of truth. Implementation follows specs.

Behavior changes start with OpenSpec. If the public API changes, update the relevant OpenSpec specs with the implementation and tests.

## Harness rule

The agent must prove changes through tests, typecheck, and OpenSpec validation.

Use focused checks while iterating, but run `npm run verify` before marking implementation work complete. If verification finds unrelated failures, report them instead of doing broad cleanup.

## CI rule

Pull requests must pass:

- `npm run typecheck`
- `npm test`
- `openspec validate --all --strict`

The local completion gate is stricter and centralized as `npm run verify`, which runs typecheck, lint, format check, tests, and strict OpenSpec validation.

## Commit rule

Use Conventional Commits for commit messages, such as `feat: add evaluation route`, `fix: validate flag keys`, or `docs: update project guidance`.

## Current architecture

- Runtime code lives in `src/`.
- `src/server.ts` starts the Express server.
- `src/api/` owns HTTP routing, request validation, and error mapping.
- `src/domain/` owns flag types, Zod schemas, repository behavior, and evaluation logic.
- Tests live in `test/` and mirror API/domain boundaries.
- Storage is intentionally in-memory for the current MVP.

## Current behavior model

FlagForge manages feature flags and evaluates them deterministically from:

- an `enabled` state;
- caller-provided context;
- simple matching rules using the supported operators.

The MVP intentionally avoids persistence, authentication, authorization, tenancy, audit logs, percentage rollouts, bucketing, segments, environments, and SDKs.

## Agent rules

- Use OpenSpec before implementing behavior changes.
- Every behavior change needs tests.
- Keep changes small.
- Use Conventional Commits for commit messages.
- Run `npm run verify` before marking work complete.
- Do not introduce persistence unless the active OpenSpec change requests it.
- Do not change public API behavior without updating OpenSpec specs.

## Context engineering rule

When chat reveals durable knowledge, move it into the right repository file. Use:

- OpenSpec specs for required behavior.
- OpenSpec changes for proposed behavior changes.
- `docs/decision-log.md` for decisions, trade-offs, consequences, and future changes.
- `docs/context.md` for the current operating map.
