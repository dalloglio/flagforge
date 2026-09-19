## Context

FlagForge is a completed v1 learning project in maintenance mode. This change introduces a local delivery-tooling experiment, not a product feature or evidence of production readiness.

The canonical local harness is `npm run verify`: typecheck, lint, format check, unit tests, OpenAPI validation, and strict OpenSpec validation. GitHub Actions performs additional checks such as PostgreSQL integration, build, Docker build, migration execution, and Helm/AWS GitOps validation. Therefore a successful local repair is not equivalent to full CI or release success.

The design intentionally separates three concerns:

1. **Functional loop** — can a bounded Codex repair converge to a green independent verifier?
2. **Hardening** — can unattended local execution be isolated strongly enough to resist tampering and contamination?
3. **CI automation** — can the proven local controller later operate safely from GitHub Actions?

This change implements the first two in sequence. CI automation is explicitly future scope.

The installed Codex CLI observed during exploration was `0.155.1`, with `--sandbox workspace-write`, `--json`, and `--output-schema` available at that point. Runtime support must be capability-tested rather than assumed from this observation.

## Goals / Non-Goals

**Goals:**

- Prove a bounded local Loop Engineering cycle using Codex CLI.
- Keep success criteria outside the agent.
- Run a fresh authoritative verifier after each admitted candidate.
- Protect the verifier/oracle from repair edits.
- Produce a reviewable patch and evidence instead of mutating user Git history.
- Stop safely on ambiguity, forbidden scope, policy violation, repeated lack of progress, or operational failure.
- Measure repair success, attempts, durations, patch size, escalation causes, and available usage data.
- Harden the local execution boundary after functional behavior has been demonstrated.

**Non-Goals:**

- Implement new FlagForge product behavior.
- Allow the repair agent to alter tests, specs, public contracts, quality gates, infrastructure, dependencies, migrations, GitHub Actions, or controller policy.
- Commit, push, open/update PRs, or publish patches automatically.
- Guarantee semantic correctness beyond the frozen harness and explicit policy.
- Treat a local green run as full CI, release, or production evidence.
- Build a general-purpose agent framework.

## Decisions

### 1. The controller owns the loop; Codex only proposes repairs

Implement a small Node.js controller under `scripts/` and expose it through an opt-in `npm run verify:repair` command. Do not modify `npm run verify` and do not call the repair controller from ordinary verification.

The controller owns:

- attempt count and deadlines;
- failure classification;
- allowed repair scope;
- candidate admission;
- reconstruction;
- verification;
- progress detection;
- terminal status;
- evidence.

Codex receives one repair assignment per invocation and may return a structured disposition such as `patch_proposed`, `cannot_repair`, or `needs_human`. Its claim is advisory. Controller-observed filesystem changes and independent verification are authoritative.

### 2. Use fixed loop semantics

A run starts with V0.

```text
preflight
   |
   v
  V0 ---- green ----> passed_initial
   |
  red
   |
classify ---- out of scope / ambiguous ----> needs_human
   |
eligible
   |
  R1 -> admit -> V1
   |            |
   |            +-- green -> repaired
   |            +-- red --> classify
   |
  R2 -> admit -> V2
   |
  R3 -> admit -> V3
   |
   +-------------------------> exhausted
```

There are at most three repair invocations and four authoritative full harness runs. Focused checks may be used by the agent for diagnosis but never replace the full verifier.

A launched repair consumes one attempt even if Codex crashes or produces no usable patch. There are no hidden retries.

Initial terminal statuses:

- `passed_initial`: V0 passed and integrity checks passed; exit 0.
- `repaired`: an admitted non-empty patch passed independent verification; exit 0.
- `exhausted`: three repair attempts were consumed without verified success; exit 10.
- `needs_human`: judgment, forbidden scope, policy violation, or no progress; exit 20.
- `operational_error`: prerequisite, process, protocol, or evidence failure; exit 30.
- `budget_exceeded`: a configured deadline was exceeded; exit 40.
- `interrupted`: operator cancellation; exit 130.

### 3. Phase 1 proves behavior with conservative local boundaries

Phase 1 requires a clean tracked worktree and no untracked non-ignored project files. The controller records the source revision and tracked-file hashes.

Use disposable copies for repair and verification. The user's checkout is never the repair workspace. A candidate is exported as a patch and reconstructed from the original baseline plus previously admitted edits before verification.

The Phase 1 repair policy is file-level and deliberately conservative. The operator may authorize existing regular TypeScript implementation files under:

- `src/domain/**`
- `src/application/**`

but a reviewed protected-file denylist always takes precedence. Phase 1 does not attempt declaration-aware editing inside mixed files.

The initial protected-file denylist includes:

- `src/domain/schemas.ts`, because external-input validation is a protected contract surface;
- `src/domain/repository.ts`, because repository contracts and in-memory implementation share the same file;
- `src/domain/audit-log.ts`, because audit contracts/types and implementation share the same file;
- `src/application/flag-use-cases.ts`, because exported application contracts/types and executable use-case implementation share the same file.

An operator allowlist cannot override this protected denylist. If the required repair is inside one of these mixed files, Phase 1 returns `needs_human`. This accepts false escalations in exchange for deterministic file-level enforcement and avoids adding declaration-aware/AST patch admission to the functional MVP. A future reviewed change may split mixed files or introduce declaration-aware enforcement if evidence justifies the complexity.

The controller may provide Codex read-only repository context for diagnosis, but repair edits outside the authorized implementation scope are rejected.

Default cumulative limits:

- at most 5 changed files;
- at most 200 added/deleted lines;
- no new files;
- no deletion or rename;
- no executable-bit change;
- no symlink/special-file patch operations.

These limits bound autonomy; they are not evidence that a patch is correct.

Phase 1 uses Codex `workspace-write` and approval policy `never`. It must not grant Git push/commit behavior, cloud credentials, Docker socket access, or explicit extra writable roots. Phase 1 records the effective CLI/version/configuration used for live experiments.

The MVP may rely on reconstruction and post-run policy inspection rather than claiming complete OS-level tamper resistance. That limitation must be explicit in the evidence and is the reason Phase 1 is not yet suitable for unattended CI execution.

### 4. Freeze the oracle independently of the repair worker

The original verification inputs form the frozen oracle:

- tests, fixtures, snapshots;
- package manifest and lockfile;
- compiler/linter/formatter configuration;
- OpenAPI and OpenSpec;
- project instructions and skills;
- controller policy and verifier command;
- GitHub Actions and infrastructure files;
- dependencies used by verification.

A repair worker may inspect required context, but candidate admission imports only authorized implementation edits. Tests/specs/configuration modified inside the repair workspace are rejected and excluded from reconstructed verification.

The verifier runs the unchanged `npm run verify` against a fresh reconstruction. A Codex statement that tests passed is never sufficient.

### 5. Keep autonomous semantics narrow

Autonomous repair is appropriate only when existing requirements/tests unambiguously establish the intended implementation behavior.

Escalate to `needs_human` when repair requires:

- a test or fixture change;
- an OpenSpec/OpenAPI change;
- new API semantics;
- security-policy judgment;
- persistence/infrastructure changes;
- dependencies or migrations;
- broader allowed repair scope;
- uncertain relationship between the failure and the proposed patch.

This intentionally favors false escalations over autonomous product decisions.

### 6. Track meaningful progress

The controller records the failed gate and a normalized diagnostic fingerprint. Because `npm run verify` is fail-fast, progression from one gate to a later gate can count as progress.

Stop and escalate on:

- empty candidate patch;
- repeated candidate/failure state;
- a detected cycle;
- two consecutive attempts without observable diagnostic or gate progress;
- explicit agent `needs_human` / `cannot_repair` when consistent with evidence.

A changed patch hash alone does not count as progress.

### 7. Structured agent protocol and evidence

The Codex adapter provides:

- failed gate;
- bounded sanitized diagnostic excerpts;
- explicit writable scope;
- relevant read-only requirements/context;
- previous attempt outcomes;
- fixed repair rules.

Diagnostics and repository content are untrusted data, not controller instructions. The adapter uses argument arrays/stdin rather than interpolating diagnostic text into shell commands.

Capture JSONL events when supported and validate a structured final response. If the selected CLI cannot provide the required protocol, report `operational_error` rather than silently changing the success model.

Artifacts live outside the repository/harness input tree and contain, at minimum:

- source identity;
- policy/tool identity;
- V0 result;
- each repair response;
- observed candidate patch;
- admission decision;
- each independent verification result;
- terminal summary.

### 8. Phase 1 experiments are first-class acceptance evidence

The functional MVP is not complete until controlled experiments exercise both success and escalation paths.

Required initial experiment classes:

1. TypeScript implementation error -> expected repair.
2. Lint/format implementation error within allowed scope -> expected repair when applicable.
3. Existing unit-test failure caused by an implementation defect -> expected repair.
4. Failure whose correct resolution requires changing a test/spec -> expected `needs_human`.
5. Public API or infrastructure change required -> expected `needs_human`.
6. Candidate attempts to modify a protected verifier input -> expected rejection.
7. Repeated ineffective candidate -> expected no-progress escalation.
8. Codex/process/protocol failure -> expected `operational_error`.
9. Initially green repository -> expected `passed_initial` with zero Codex invocations.

The experiment fixtures must be deterministic and reversible. Results are evidence for calibration, not permanent intentional defects in `main`.

### 9. Phase 2 hardens unattended local execution

After Phase 1 demonstrates the loop, implement and validate stronger isolation. The first supported hardening target is Linux.

Evaluate an unprivileged OS isolation backend such as bubblewrap/namespaces. Phase 2 should prove, where supported:

- protected-file writes and atomic replacement are denied;
- controller/evidence/verifier state is outside worker write access;
- worker process descendants terminate with the attempt;
- project/cloud/Git/SSH credentials and Docker socket are unavailable;
- shell command network access is restricted while model-client authentication remains usable;
- writable caches/scratch are scoped per worker;
- symlink, hard-link, and path traversal cannot bypass repair scope;
- Codex extension surfaces that could expand authority are constrained or cause fail-closed behavior.

If these properties cannot be enforced for a selected environment, the hardened live path must report `operational_error`. No prompt-only claim may substitute for hardening evidence.

Phase 2 does not change the success authority or functional state machine.

### 10. CI automation is a separate change

This proposal does not modify GitHub Actions.

A future change may integrate the controller after Phase 1/2 evidence exists. CI-specific concerns such as runner trust, repository tokens, automated branch mutation, PR publication, artifact upload, and permission boundaries require their own design and review.

## Risks / Trade-offs

- A conservative file-level repair scope will escalate some failures Codex could technically fix, including repairs inside known files that mix contracts and implementation. This is intentional while calibrating autonomy and keeps Phase 1 enforcement deterministic.
- Phase 1 reconstruction/policy inspection does not claim the same security guarantees as Phase 2 OS isolation.
- Frozen tests can preserve an incorrect test; such cases must escalate rather than "repair" the oracle.
- Fail-fast verification exposes only the next gate, so progress metrics must distinguish gate progression from global failure-count reduction.
- The extra reconstruction/verifier cycle adds local runtime cost but preserves independence.
- Stronger Phase 2 isolation may be Linux-specific and add local prerequisites.

## Validation Strategy

Phase 1 completion requires:

- deterministic controller tests with fake verifier/Codex adapters;
- policy/admission tests;
- state-machine and progress tests;
- clean/stale checkout tests;
- the controlled experiment matrix above;
- at least one recorded real Codex repair demonstration on a supported local environment;
- `npm run verify` and strict OpenSpec validation.

Phase 2 completion requires additional adversarial isolation tests and a recorded live hardened demonstration with exact tool/backend versions and limitations.

No mocked/static evidence may be described as proof of a live repair or hardened execution boundary.
