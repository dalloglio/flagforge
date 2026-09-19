## 1. Prove the supported local execution boundary

- [ ] 1.1 Inspect the pinned Codex CLI and model configuration; document supported flags, response/events, authentication separation, and how unauthorized hooks, apps, MCPs, plugins, and nested agents are disabled.
- [ ] 1.2 Prototype a Linux isolation adapter in disposable fixtures and record the selected backend/minimum versions; prove protected-file writes, atomic replacement, path aliases, shared temporary paths, and access to controller state are denied.
- [ ] 1.3 Prove worker credential/network/process isolation and verifier-local Supertest sockets; make unsupported environments fail closed before real repair, without fallback permissions.

## 2. Define controller contracts and preflight

- [ ] 2.1 Add local controller modules under `scripts/` with explicit policy, command arguments, versioned request/result schemas, terminal statuses, and exit-code mappings from the design.
- [ ] 2.2 Implement clean-input checks, operator-authorized baseline and exact file allowlist, tool/environment identity capture, and prerequisite reporting without Git mutations or automatic setup installation.
- [ ] 2.3 Implement original snapshot inventories, isolated candidate/verifier copies, immutable dependency inputs, private scratch paths, and stale-source detection.
- [ ] 2.4 Implement controller-owned run directories, concurrency protection, scoped disposal, and evidence retention without changing the user's checkout.

## 3. Implement independent verification and bounded control flow

- [ ] 3.1 Add the verifier adapter that executes the unchanged `npm run verify` with controlled environment, authoritative exit status, gate progression, and before/after oracle integrity checks.
- [ ] 3.2 Implement initial-pass short circuit, at most three counted repair invocations, independent verification per admissible patch, and all terminal transitions without hidden retries.
- [ ] 3.3 Implement per-process/global deadlines, cancellation, whole-worker-tree termination, and non-success handling for evidence/process failures.
- [ ] 3.4 Implement conservative failure classification, stable diagnostic fingerprints, cycle/empty-patch detection, and the two-attempt no-progress rule while allowing legitimate advancement to later gates.

## 4. Integrate scoped Codex repair and patch admission

- [ ] 4.1 Add the Codex adapter using explicit `workspace-write`, approval policy `never`, controlled configuration, JSONL capture, and validated structured responses; pass bounded sanitized context through argument arrays/stdin.
- [ ] 4.2 Enforce the fixed protected surfaces and operator allowlist; inspect full repository inventories and reject disallowed creation, removal, rename, links, special files, mode changes, and cumulative size-limit violations.
- [ ] 4.3 Add delta-based bypass/suppression detection and failure-linked patch rationale checks; escalate uncertain semantics, relevance, required test changes, or wider scope instead of approving them automatically.
- [ ] 4.4 Reconstruct each verifier candidate from the original snapshot plus admitted cumulative edits; prevent transfer of worker caches, dependencies, reports, or surviving processes.
- [ ] 4.5 Export a hash-identified final patch only after independent verification and policy success; preserve unsuccessful candidates separately as unverified evidence.

## 5. Produce evidence and local metrics

- [ ] 5.1 Record manifests, raw captured streams, structured agent responses, patch/policy decisions, independent verification, and terminal reports with source/candidate/tool/policy identities.
- [ ] 5.2 Implement restrictive artifact access, sanitization, explicit truncation, stream/run size ceilings, and failure behavior for missing evidence or exhausted storage.
- [ ] 5.3 Record initial pass, eligible repair outcomes by attempt, escalation/violation reasons, durations, patch statistics, and available token/cost data; document denominators and unknown usage values.
- [ ] 5.4 Provide a concise human handoff identifying the last failure, attempted fixes, candidate validity, and the decision needed; keep reports outside the harness input tree and disable automatic uploads.

## 6. Verify lifecycle and adversarial behavior

- [ ] 6.1 Add deterministic tests with fake verifier/Codex adapters for initial green, repair success at each attempt, exhaustion, operational errors, human escalation, and malformed/incomplete agent responses.
- [ ] 6.2 Test cancellation, timeouts, descendant termination, no hidden retries, concurrency, dirty/stale inputs, and preservation of user files and Git history.
- [ ] 6.3 Test every protected surface and patch-operation restriction, cumulative limits, temporary write-and-restore attempts, symlink/hard-link/path traversal, ignored-file tampering, and protected evidence access.
- [ ] 6.4 Test reward-hacking examples, malicious diagnostic instructions, forged green output, worker dependency/cache contamination, and oracle-integrity failure after a zero exit status.
- [ ] 6.5 Test gate progression, identical failures with changed patches, repeated states/cycles, empty patches, inconsistent/flaky evidence, and out-of-scope failures from static infrastructure tests.
- [ ] 6.6 Test artifact sanitization/truncation/storage failures and success-rate denominators; verify missing usage is not represented as zero.
- [ ] 6.7 Run supported-platform isolation checks and a real harness smoke in disposable copies, then an explicitly local live-Codex repair demonstration; record versions, prerequisites, observed outcomes, and limits separately from mocked tests.

## 7. Integrate the opt-in workflow and document evidence

- [ ] 7.1 Add the separate `verify:repair` npm entrypoint without modifying `verify`, existing CI workflows, infrastructure, runtime behavior, or public API contracts; ensure controller tests join the ordinary test suite without model access.
- [ ] 7.2 Create an ADR and local runbook covering invocation, clean-input/allowlist preparation, protected paths, budgets, terminal outcomes, patch review/application by a human, retention/cleanup, and unsupported-environment diagnostics.
- [ ] 7.3 Align affected README, context, agent guidance, and current-status summaries with actual local evidence; distinguish planned design, deterministic tests, live repair, full CI, and production operation.
- [ ] 7.4 Review architecture, QA, and security/operability concerns using applicable repository guidance; resolve findings about isolation, verifier independence, bypasses, and human escalation before claiming completion.
- [ ] 7.5 Run `npm run verify` and strict OpenSpec validation, inspect the final scope and sensitive-data boundaries, and record any unrelated failures without broad cleanup.
