## Why

FlagForge has a canonical deterministic verification harness, but diagnosing and repairing a failed local run still requires a manually coordinated feedback cycle. Introduce a bounded local Loop Engineering experiment that tests whether Codex CLI can observe an eligible verification failure, produce a minimal implementation patch, and converge to a green independent verifier without controlling its own success criteria.

The first objective is to prove the loop behavior and collect evidence. Stronger OS-level isolation is a hardening phase after the functional loop is demonstrated. GitHub Actions integration remains a separate future change.

## What Changes

- Add an opt-in local controller that runs the unchanged `npm run verify`, captures failure evidence, classifies eligibility, and invokes `codex exec` only for bounded repairs.
- Keep the controller and verifier outside the agent. Codex proposes a candidate; the controller observes the filesystem and the independent verifier decides success.
- Bound a run to three repair invocations, with a fresh full verification after each admitted patch.
- Use disposable repair and verification copies, a clean-input prerequisite, `workspace-write`, approval policy `never`, explicit repair scope, patch-size limits, and protected verification inputs.
- Freeze tests, quality configuration, dependencies, OpenSpec, OpenAPI, agent instructions, controller policy, infrastructure, migrations, GitHub Actions, and public contracts during repair.
- Return a verified patch and machine-readable evidence without applying it to the user's checkout, committing, pushing, or opening a PR.
- Treat ambiguous product/API/security/persistence decisions, required test/spec changes, broader repair scope, policy violations, and repeated lack of progress as human escalation.
- Validate the functional loop with controlled experiments before introducing OS-level isolation hardening.
- Add a second hardening phase for stronger filesystem/process/network/credential isolation and adversarial defenses.
- Keep CI-triggered repair, branch mutation, PR updates, and publication outside this change.

## Capabilities

### New Capabilities

- `local-self-healing-verification`: An opt-in local verification and repair loop with bounded execution, independent verification, explicit repair policy, evidence capture, and human escalation.

### Modified Capabilities

None. Existing `ci-quality`, `delivery-workflow`, public behavior, and release evidence remain unchanged. The new controller consumes the canonical harness without redefining it.

## Delivery Phases

### Phase 1 — Functional Loop MVP

Prove the core feedback cycle:

```text
V0 -> classify -> Codex repair -> inspect patch -> reconstruct -> V1
                         ^                                  |
                         |----------- retry ----------------|
```

Phase 1 must demonstrate:

- independent success authority;
- at most three repair attempts;
- explicit allowed implementation scope;
- frozen verifier inputs;
- patch-only handoff;
- progress/no-progress handling;
- deterministic controller tests without live model calls;
- controlled live Codex experiments for representative repairable and non-repairable failures.

### Phase 2 — Hardening

Strengthen unattended local execution after the functional loop is proven:

- OS-enforced protected surfaces;
- stronger process/network/credential isolation;
- symlink/hard-link/path-traversal defenses;
- cache/dependency contamination defenses;
- controlled Codex extension surfaces;
- adversarial evidence and prompt-injection tests.

Phase 2 hardening must not redefine the functional loop or make Codex the success authority.

### Future Change — CI Automation

A separate reviewed change may later integrate the proven/hardened controller with GitHub Actions. It may cover CI failure ingestion, automated branch/PR updates, runner isolation, publication, and repository permissions.

## Impact

- Implementation will introduce local tooling under `scripts/`, supporting tests under `test/`, and a separate `verify:repair` npm entrypoint.
- The existing `verify` command, CI workflows, infrastructure, runtime behavior, public API, and persistence behavior remain unchanged.
- Phase 1 may require Codex CLI for live experiments, but normal tests must use fake adapters and must not consume model credentials.
- Phase 2 may add a supported Linux isolation backend as a local tooling prerequisite; unsupported environments must fail closed rather than silently weakening protections.
- Documentation will add an ADR/runbook and record evidence by phase. A successful Phase 1 run proves only that the bounded local loop worked for that identified candidate and verifier; it does not claim full CI, release, production, or hardened unattended operation.
