## Context

FlagForge already has discrete quality commands for type checking, linting, formatting, and tests. GitHub Actions runs typecheck, lint, and tests, while OpenSpec validation is only run manually. The repository guidance asks developers to run several commands before opening a PR, but there is no single command that defines "done" for agents or developers.

The verification harness should make local validation and CI validation predictable without changing application behavior. It should also avoid hidden workspace mutations when used as a gate.

## Goals / Non-Goals

**Goals:**

- Provide one local npm command that verifies type safety, linting, formatting, tests, and OpenSpec validity.
- Keep formatting fixes available through the existing `format` script while using a read-only formatting check in verification.
- Make CI validate OpenSpec strictly, with JSON output for automation-friendly logs.
- Document the agent completion contract in repository guidance.

**Non-Goals:**

- Change application runtime behavior or API contracts.
- Add new test frameworks, linters, or formatters.
- Make CI auto-format code or commit generated output.
- Require agents to fix unrelated failures uncovered by the verification harness.

## Decisions

- Add `format:check` and use it inside verification.
  - Rationale: `prettier --write .` mutates files, which is useful as a fixer but weak as a completion gate. `prettier --check .` fails predictably when formatting is wrong.
  - Alternative considered: use `npm run format` inside `verify`. This was rejected because a verify command should report drift instead of silently changing the workspace.

- Add `verify` as the local completion command.
  - Rationale: `npm run verify` gives agents and developers one stable contract for "the current work is validated."
  - The command should run `typecheck`, `lint`, `format:check`, `test`, and `openspec validate --all --strict`.
  - Alternative considered: add `check` instead of `verify`. `verify` is clearer for completion gating and avoids ambiguity with individual check tools.

- Make CI run an automation-oriented verification path.
  - Rationale: CI should enforce the same quality surface as local verification and include strict OpenSpec validation.
  - CI can either run `npm run verify` plus a dedicated `openspec validate --all --strict --json` step, or expose a `verify:ci` script that uses JSON for the OpenSpec step.
  - Preferred implementation: add a dedicated `openspec validate --all --strict --json` step so the CI workflow remains concise and the JSON OpenSpec behavior is versioned in `package.json`.

- Update repository guidance to name the harness explicitly.
  - Rationale: The verification command only helps agent behavior if the completion rule is part of the repo instructions.
  - Guidance should say to run `npm run verify` before considering a task done and to fix only failures directly related to the current change.

## Risks / Trade-offs

- `verify` may take longer than running a focused test command during development → Use focused commands while iterating, then run `verify` at completion.
- CI and local verification can drift if CI spells out individual commands separately → Prefer a `verify:ci` npm script or a single workflow step that delegates to package scripts.
- JSON OpenSpec output is less readable for local use → Keep local `verify` on human-readable OpenSpec output and use JSON only for the CI path.
- Existing unrelated issues could cause `verify` to fail → Agent guidance limits fixes to failures directly related to the current change and requires reporting unrelated failures instead of broad cleanup.
