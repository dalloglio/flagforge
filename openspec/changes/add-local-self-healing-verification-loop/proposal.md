## Why

FlagForge has a canonical deterministic verification harness, but diagnosing and repairing a failed local run still requires a manually coordinated feedback cycle. Introduce a bounded local Loop Engineering experiment that produces reviewable repair patches while preserving the harness as an independent authority and escalating work that exceeds explicit permissions.

## What Changes

- Add an opt-in local controller that runs `npm run verify`, captures failure evidence, and invokes Codex CLI only for eligible repairs.
- Bound each run to three repair invocations, with independent verification after each admissible patch, per-process timeouts, and a total deadline.
- Use `codex exec` with `workspace-write`, no approval escalation, controlled configuration, and isolated disposable repair and verification workspaces.
- Enforce an explicit file allowlist and immutable verification inputs. Freeze tests, quality configuration, dependencies, OpenSpec, public API contracts, migrations, infrastructure, secrets, and agent/control instructions during repair.
- Return a verified patch and an evidence report without modifying the user's checkout, committing, pushing, or performing destructive Git operations.
- Record machine-readable outcomes, logs, policy decisions, failure fingerprints, and local metrics, including safe escalation and unsuccessful attempts.
- Add adversarial and lifecycle tests for the controller, plus an ADR and local runbook during implementation. Keep future GitHub Actions integration as a separately scoped change.

## Capabilities

### New Capabilities

- `local-self-healing-verification`: An opt-in local verification and repair loop with bounded execution, independent verification, enforced repair scope, evidence capture, and human escalation.

### Modified Capabilities

None. Existing `ci-quality`, `delivery-workflow`, and product requirements remain in force. The new controller consumes the canonical harness without redefining it or making repair part of ordinary verification.

## Impact

- Implementation will introduce local tooling under `scripts/`, supporting tests under `test/`, and a separate npm entrypoint; the existing `verify` command and its gates remain unchanged.
- Documentation will include an accepted decision, operating instructions, and affected context/current-status summaries describing only evidence actually obtained.
- Codex CLI and a supported local isolation mechanism are runtime prerequisites for repair. Missing authentication, tools, or isolation cause a reported stop, not dependency installation or permission expansion inside a repair attempt.
- Project skills remain instruction-only under `.agents/skills/`; this change does not require a new skill or modifications to OpenSpec-managed skills.
- No FlagForge runtime, public API, database migration, deployment, infrastructure, or GitHub Actions behavior changes are included. No cloud resources, telemetry backend, commits, pushes, or automated patch publication are introduced.
- A successful run proves the local harness and repair policy passed for an identified candidate; it does not prove full CI, PostgreSQL integration, release readiness, or production operation.
