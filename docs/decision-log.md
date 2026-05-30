# Decision Log

## 0001 - Start with in-memory storage

Reason: faster learning loop focused on API contracts, deterministic behavior, tests, and OpenSpec.

Consequence: data is lost on restart and the service is not production-persistent.

Future change: add SQLite persistence through a dedicated OpenSpec change.

## 0002 - Keep the MVP feature flag model small

Reason: `enabled` state plus simple `equals` and `in` context rules are enough to exercise validation, evaluation, and tests.

Consequence: the API does not yet support percentage rollouts, bucketing, segments, environments, SDKs, or advanced targeting.

Future change: add rollout and targeting capabilities through new OpenSpec specs.

## 0003 - Separate HTTP wiring from domain behavior

Reason: an Express app factory keeps Supertest integration tests simple, and pure domain evaluation is easier to test directly.

Consequence: route handlers stay focused on transport, validation, and response mapping.

Future change: keep new business behavior in domain modules before exposing it through routes.

## 0004 - Validate external input with Zod

Reason: request bodies and route parameters are untrusted, and Zod provides runtime validation aligned with TypeScript types.

Consequence: public API contract changes must update schemas, tests, and OpenSpec specs together.

Future change: extend schemas only when an active OpenSpec change modifies the API contract.

## 0005 - Use a single verification harness

Reason: `npm run verify` gives agents and developers one completion gate for typecheck, lint, format check, tests, and strict OpenSpec validation.

Consequence: implementation work is not complete until the harness passes, or unrelated failures are reported explicitly.

Future change: keep CI and local verification aligned as quality gates evolve.

## 0006 - Treat context engineering as versioned repository knowledge

Reason: important project context should live in files that agents, OpenSpec, and CI can read instead of remaining only in chat.

Consequence: repository guidance, context maps, specs, and decision logs become the source of truth for future work.

Future change: update these files whenever decisions or working rules change.

## 0007 - Use Conventional Commits

Reason: commit messages should be consistent, machine-readable, and easy to scan in project history.

Consequence: agents and contributors should use Conventional Commits such as `feat: add evaluation route`, `fix: validate flag keys`, and `docs: update project guidance`.

Future change: add automated commit message linting if consistency becomes difficult to maintain manually.
