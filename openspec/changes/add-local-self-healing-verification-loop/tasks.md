## 1. Phase 1 — Prove the functional loop

- [ ] 1.1 Inspect the installed Codex CLI and record the tested version/capabilities required by the MVP, including non-interactive execution, `workspace-write`, approval policy `never`, structured/JSON output support, and authentication prerequisites.
- [ ] 1.2 Define versioned controller request/result schemas, terminal statuses, exit-code mappings, attempt budgets, timeouts, patch limits, and operator-configured repair scope.
- [ ] 1.3 Add a small Node.js controller under `scripts/` and a separate `verify:repair` npm entrypoint without modifying the existing `verify` command.
- [ ] 1.4 Implement clean-input checks, source revision/tracked-file hashes, stale-source detection, disposable repair/verifier copies, and controller-owned evidence directories outside the repository harness tree.
- [ ] 1.5 Implement V0, failure classification, at most three counted repair invocations, no hidden retries, and all terminal state transitions.

## 2. Phase 1 — Integrate Codex and independent verification

- [ ] 2.1 Implement the Codex adapter using non-interactive execution, `workspace-write`, approval policy `never`, bounded sanitized context, structured completion parsing, and no commit/push behavior.
- [ ] 2.2 Implement the protected-oracle inventory and deterministic file-level admission policy. Accept only operator-authorized existing TypeScript implementation files under `src/domain/**` or `src/application/**`; enforce a non-overridable initial denylist for `src/domain/schemas.ts`, `src/domain/repository.ts`, `src/domain/audit-log.ts`, and `src/application/flag-use-cases.ts`; use default cumulative limits of five files and 200 changed lines.
- [ ] 2.3 Reject protected-file changes, new files, deletion/rename, mode/link/special-file changes, dependency/config/spec/test/API/infrastructure changes, and automatic scope expansion.
- [ ] 2.4 Reconstruct every verifier candidate from the original baseline plus admitted cumulative implementation edits; do not verify inside the repair worker's mutable workspace.
- [ ] 2.5 Run the unchanged `npm run verify` after every admitted candidate; only its authoritative result may produce `repaired`.
- [ ] 2.6 Implement gate/failure fingerprints, candidate identity, gate progression, empty-patch detection, cycle/repeated-state detection, and two-attempt no-progress escalation.
- [ ] 2.7 Export a hash-identified verified patch and human-readable/machine-readable evidence without applying it to the user's checkout or Git history.

## 3. Phase 1 — Deterministic tests and controlled experiments

- [ ] 3.1 Add fake verifier/Codex adapters and deterministic controller tests for initial green, repair success on R1/R2/R3, exhaustion, `needs_human`, `operational_error`, timeouts, malformed agent output, and interruption.
- [ ] 3.2 Test repair policy and reconstruction: protected inputs, non-overridable mixed-file denylist behavior, unauthorized paths, cumulative limits, empty patches, repeated states, stale/dirty inputs, and preservation of user files/Git history.
- [ ] 3.3 Add reversible controlled experiment fixtures for: TypeScript failure, lint/format failure when applicable, implementation-caused unit-test failure, required test/spec change, required API/infrastructure change, protected-file tampering, repeated ineffective repair, Codex/protocol failure, and initially green input.
- [ ] 3.4 Run at least one real local Codex repair demonstration on a supported environment and record exact CLI/configuration, initial failure, attempts, candidate patch, independent verifier result, and limitations.
- [ ] 3.5 Record Phase 1 metrics: eligible repair success, attempts, durations, gate progression, patch size, escalation/policy reasons, and available usage data. Keep initially green and ineligible runs out of the repair-success denominator.

## 4. Phase 1 — Document the proven operating model

- [ ] 4.1 Create an ADR describing controller-owned success authority, frozen oracle, patch-only handoff, conservative autonomy boundaries, and the separation between functional proof, hardening, and future CI automation.
- [ ] 4.2 Add a local runbook covering invocation, clean-input preparation, allowed repair scope, budgets, terminal outcomes, evidence, patch review/application, and known Phase 1 limitations.
- [ ] 4.3 Update affected README/context/current-status guidance as implementation evidence changes; preserve the planning classification already recorded in `docs/project-status.md` and distinguish planned design, mocked tests, live local repair evidence, hardened execution, full CI, and production evidence.
- [ ] 4.4 Review Phase 1 with Staff/QA/security-operability guidance, run `npm run verify`, and run strict OpenSpec validation before claiming the functional MVP complete.

## 5. Phase 2 — Harden unattended local execution

- [ ] 5.1 Select and document the first supported Linux isolation backend/minimum versions, evaluating an unprivileged mechanism such as bubblewrap/namespaces.
- [ ] 5.2 Prove protected verification/controller files cannot be modified through direct writes, atomic replacement, unlink/rename, symlink/hard-link/path traversal, or shared temporary paths.
- [ ] 5.3 Prove repair worker descendants are terminated on completion/timeout and cannot continue mutating controller-owned state.
- [ ] 5.4 Separate model-client authentication from worker execution credentials; prevent worker access to project/cloud/Git/SSH secrets, Docker socket, unrestricted user-home state, and unauthorized Codex extension surfaces.
- [ ] 5.5 Constrain worker command network access and per-worker caches/scratch while preserving only the model-client connectivity required by the supported Codex execution model.
- [ ] 5.6 Add adversarial tests for malicious diagnostics, forged green claims, cache/dependency contamination, path aliases, protected evidence tampering, and attempts to weaken the verifier.
- [ ] 5.7 Fail closed with `operational_error` when the hardened execution boundary cannot be enforced; do not claim prompt-only or post-diff checks as equivalent isolation.
- [ ] 5.8 Run and record a hardened live Codex repair demonstration, then rerun `npm run verify` and strict OpenSpec validation.

## 6. Future change — CI automation

- [ ] 6.1 Do not modify GitHub Actions in this change.
- [ ] 6.2 Capture follow-up requirements for a separate OpenSpec change covering CI failure ingestion, trusted runner design, repository/token permissions, branch/PR mutation, artifact publication, and CI-specific human gates.
