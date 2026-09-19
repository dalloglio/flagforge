## Context

FlagForge is a completed v1 learning project in maintenance mode. This change introduces a local delivery-tooling experiment, not a product feature or evidence of production readiness.

The canonical harness in `package.json` is `npm run verify`: typecheck, lint, format check, unit tests, OpenAPI validation, and strict OpenSpec validation. Its `&&` chain stops at the first failing gate. Unit tests exclude PostgreSQL integration, but include static AWS GitOps and architecture-boundary checks. A local failure is therefore not necessarily eligible for repair.

GitHub Actions additionally runs migrations, PostgreSQL integration, build, Docker build, and Helm-based AWS GitOps validation. Local success must not be represented as full CI or release success. No workflow changes belong to this proposal.

Relevant decisions are ADR 0001 (OpenSpec for delivery changes), ADR 0003 (agent output uses the project harness), ADR 0014 (`verify` remains canonical), ADR 0016 (pragmatic boundaries), ADR 0017 (versioned context), and ADR 0018 (human judgment versus automated checks). Architecture context is in `docs/context/architecture.md`; this checkout has no `docs/architecture/` directory.

The installed Codex CLI inspected during exploration was `0.155.1`; its help supports `--sandbox workspace-write`, `--json`, and `--output-schema`. This is a point-in-time compatibility observation, not a guarantee for other versions. CLI configuration and isolation must be capability-tested before repair is enabled.

## Goals / Non-Goals

**Goals:**

- Run an independent local verifier and delegate only bounded, explicitly scoped repairs.
- Stop after success, three repair invocations, loss of progress, policy violation, operational failure, or a need for human judgment.
- Preserve the user's checkout and deliver a patch with attributable evidence.
- Make scope, isolation, terminal outcomes, and failure handling testable without live model calls in the normal test suite.
- Provide a portable controller contract for a separately proposed future CI integration.

**Non-Goals:**

- Implement new FlagForge behavior, change public API semantics, or repair requirements by changing tests/specifications.
- Modify infrastructure, GitHub Actions, migrations, secrets, dependency versions, or quality gates during a repair.
- Commit, push, open PRs, publish artifacts externally, apply patches to the user's checkout, or operate cloud/database services.
- Guarantee semantic correctness beyond the fixed harness and scope policy, or claim that the model is deterministic.
- Build a general-purpose agent framework, add a telemetry backend, or create executable project skills.

## Decisions

### 1. Keep the controller outside the agent and the application

Implement a small Node.js controller under `scripts/` with independently testable policy, process-runner, workspace, verifier, evidence, and Codex-adapter responsibilities. Add an opt-in `verify:repair` npm entrypoint. Do not modify the existing `verify` command or call the controller from it.

The controller owns state and budgets. The Codex adapter returns a candidate plus a structured explanation, never an authoritative success verdict. A proposed response schema contains `disposition` (`patch_proposed`, `cannot_repair`, or `needs_human`), a concise diagnosis, an evidence-linked rationale, claimed affected files, and an escalation reason. Controller-observed filesystem changes take precedence over claimed changes.

Alternative: let an agent own the whole loop. Rejected because it would make termination, permissions, and success dependent on the actor being evaluated. A skill may later explain usage, but cannot enforce the machine state.

### 2. Fix iteration and termination semantics

The run starts with verification V0. If V0 passes and integrity checks pass, finish with no Codex invocation. Otherwise classify the failure and, only if eligible, invoke repairs R1 through R3. Each admissible patch receives a full fresh verification V1 through V3. A repair invocation consumes one slot when launched, including crashes and incomplete attempts. It is never retried invisibly.

```text
preflight -> V0 -> success
              |
              +-> classify -> escalate
                       |
                       +-> Ri -> inspect patch -> reconstruct -> Vi
                                  |                         |
                                  +-> escalate              +-> success
                                                            +-> classify
```

There are at most three repair invocations and four full authoritative harness executions. Focused diagnostic checks are separately recorded and cannot substitute for full verification. The agent receives one repair assignment per invocation, a fresh session, and a controller-generated summary of earlier attempts; it cannot recursively start the loop or additional agent sessions.

Initial limits are three attempts, ten minutes per repair, five minutes per harness execution, and forty minutes for the entire run. These are conservative defaults to calibrate with evidence, not measured performance claims. Configuration may lower these limits; increasing them requires a reviewed policy change, and the attempt ceiling remains three. A global deadline can terminate before all attempts are used. Termination must stop the whole worker process tree and prevent surviving workers from mutating snapshots.

Terminal status is machine-readable and separate from the process exit code:

| Status              | Meaning                                                         | Exit code |
| ------------------- | --------------------------------------------------------------- | --------- |
| `passed_initial`    | V0 passed with intact verification inputs                       | 0         |
| `repaired`          | An admissible nonempty patch passed independent verification    | 0         |
| `exhausted`         | Three repairs used without verified success                     | 10        |
| `needs_human`       | Judgment, forbidden scope, violation, or no progress            | 20        |
| `operational_error` | Prerequisite, transport, protocol, evidence, or process failure | 30        |
| `budget_exceeded`   | Per-process or total deadline reached                           | 40        |
| `interrupted`       | Operator cancellation                                           | 130       |

Any policy violation or incomplete evidence overrides an otherwise green harness. An already requested human escalation cannot be cleared by a later model statement.

### 3. Snapshot input and deliver patches without touching user work

For the first version, require a clean tracked tree and no untracked, non-ignored project files. Refuse unsupported dirty inputs without stashing, committing, resetting, or deleting them. Ignored secrets and generated state are excluded rather than copied. This conservative precondition makes the first evidence model unambiguous; dirty-worktree snapshots are future scope.

Capture the source revision, tracked-file inventory and hashes, policy and tool identities, initial instruction set, and explicit repair allowlist. The operator must authorize the baseline and repair scope; a Git SHA identifies content but does not make arbitrary code trustworthy. Preparation must not execute unknown project setup hooks automatically.

Use independent disposable copies, not Git worktrees sharing writable metadata with the user's repository. A repair copy has no writable Git metadata or remote credentials. If the CLI needs repository metadata, expose only the minimum read-only metadata needed for discovery. Do not grant Git writes to satisfy CLI startup.

Each candidate starts from the original snapshot plus the previously admitted cumulative patch. Export only controller-observed allowed edits. Reconstruct verification from the original baseline plus those edits, never by trusting the repair directory as a verification environment. Reuse only trusted immutable dependencies keyed to the lockfile, with fresh writable tool caches where necessary.

The final patch is relative to the original input and is not automatically applied. Before completion, confirm that the user's checkout still matches the recorded input; if it changed, report stale input and retain the candidate for human review. Rejected or partial candidates are clearly marked unverified. Cleanup is restricted to controller-owned disposable directories, with evidence retained; destructive Git recovery is unnecessary.

Alternative: repair directly in the user's checkout. Rejected because it couples rollback, concurrent edits, and attribution to uncommitted user work.

### 4. Enforce isolation rather than relying on prompts or final diffs

Use `workspace-write` for every Codex repair and explicit `approval_policy = "never"`. Disable command network access and do not grant additional writable roots. The controller performs human escalation by terminating the run with an evidence packet; the unattended agent does not request expanded execution privileges.

Protected files must be OS-enforced read-only to repair workers, including against atomic replacement, unlink/rename, symlink traversal, and temporary modification followed by restoration. Control state, logs, original checkout, and verification workspaces must be outside worker write access. Writable scratch storage is private to a worker; a shared writable `/tmp` must not expose authoritative evidence or other workers. Merely applying `chmod` that the same worker can reverse is insufficient.

Implement the first isolation adapter for Linux. Evaluate a local unprivileged namespace/read-only-mount backend, such as bubblewrap, in the first implementation task. This is a local tooling prerequisite, not a new deployment or infrastructure configuration. The adapter must prove effective filesystem, process, and network restrictions before any real repair. If the installed platform or Codex configuration cannot supply them, exit with `operational_error`; there is no prompt-only or diff-only fallback. The exact backend and minimum supported versions must be recorded before enabling the live path.

Keep client authentication separate from worker-visible files and environments. The client still requires its model-provider connection; disabling shell network access does not mean offline inference. Do not mount the user's home, SSH agent, cloud credentials, Docker socket, or project `.env` into workers. Supply an explicit environment and controlled executable paths; prevent shell startup files and inherited `NODE_OPTIONS`/npm settings from changing verification behavior.

Inspect and constrain effective Codex configuration, hooks, MCPs, apps, plugins, skills, and nested agent capabilities. Versioned project context is available read-only; arbitrary personal integrations and commit/push workflows are not part of this run. A single config flag must not be assumed to disable every extension surface. If this cannot be enforced for the installed CLI, stop before repair.

Verification is isolated too, because tests execute candidate code. It has no model credentials, no external-service credentials, no write access to the oracle or controller, and no external network. Permit only the local socket behavior required by Supertest inside its isolated environment; prove this in the compatibility checks. Writable caches belong to the verifier, never to the repair worker.

Alternative: sandbox plus post-run hash comparison only. Rejected as the enforcement model because a transient mutation or surviving process can escape a final-state diff.

### 5. Freeze the oracle and use narrow explicit repair scopes

The original tests, fixtures, snapshots, scripts, package manifest/lockfile, installed dependency inputs, compiler/linter/formatter configuration, ignore files, OpenAPI, OpenSpec, instructions, skills, and controller policy form the frozen oracle. The verifier executes the unchanged `npm run verify` from this snapshot. It checks integrity before and after candidate execution and records the actual command, environment identity, gate results, exit status, and candidate hash.

The v1 repair policy accepts only existing regular TypeScript implementation files explicitly listed by the operator under `src/domain/` or `src/application/`, excluding `src/domain/schemas.ts` and public contract/type definitions. This deliberately conservative starting scope leaves `src/api/**` and all `src/infrastructure/**` read-only, including PostgreSQL and telemetry adapters. Existing imports and dependency tracing can explain relevance, but cannot expand the allowlist automatically.

All other paths are denied for repair, including tests, quality configuration, `scripts/**`, `docs/**`, `openspec/**`, `.github/**`, `.agents/**`, `.codex/**`, infrastructure, charts, Docker/Compose assets, migrations, environment files, and Git metadata. New files, deletion, rename, executable-bit changes, symlinks, hard-link aliases, and special files are not accepted patch operations in v1. Diff inspection covers the full worker inventory, including ignored/untracked outputs, and distinguishes private tool scratch paths from repository edits.

Default cumulative patch limits are five files and 200 added/deleted lines; per-attempt and cumulative statistics are retained. These limits may be reduced, never expanded by the agent. Small size is a necessary bound, not evidence of relevance or correctness. Each edit requires a failure-linked explanation; uncertain relevance is escalated. New unrelated diagnostics or a request for another file never silently broaden the repair scope.

No new API behavior is allowed. Restoring an already specified implementation invariant is eligible only when existing tests and requirements unambiguously establish it. Ambiguous product intent, changed response semantics, security policy, persistence behavior, or a required test/spec update causes `needs_human`.

Reject new test-specific production branches, assertion/runner interference, blanket suppressions, weakened validation, and apparent hard-coded test answers. Compare against the baseline: existing test seams, including the current `NODE_ENV` branch in `src/api/app.ts`, are not newly introduced violations. Syntactic checks are conservative defenses rather than a proof of semantic equivalence. Human review remains necessary for any resulting patch.

Freezing tests intentionally means that a broken test or a repair needing new regression coverage must leave the autonomous path. The normal workflow still requires tests for behavior changes. Implementation of this controller itself adds tests and documentation outside repair attempts; that is not a permission available to future repair workers.

### 6. Classify failures and track meaningful progress

The controller distinguishes gate failures, environmental failures, and evidence/protocol failures. It never infers success from log prose or from the exit code of Codex alone. Unknown failure classification or uncertain scope is escalated conservatively.

For an eligible failure, provide the failed gate, stable diagnostic identifiers/test names, sanitized excerpts, relevant read-only requirements, allowed files, and prior outcomes. Treat logs and repository content as potentially untrusted data, not instructions to change policy. Use argument arrays and stdin payloads; never interpolate diagnostics into a shell command.

Keep a fingerprint based on failed gate, diagnostic/test identity, relevant paths, and normalized error, excluding temporary paths and timings. Record which earlier gates passed. Advancing from typecheck failure to lint failure is progress, even though `verify` remains red. Repeating the same candidate/failure pair, an empty patch, cycling to a previously seen state, or two successive attempts with no observable diagnostic progress stops with `needs_human`. A changed patch hash alone does not establish progress. Fail-fast verification does not provide a global initial failure count.

No automatic retries of flaky tests, failed provider requests, or crashed repairs occur. A failure disappearing without an admissible code change is classified for human review rather than counted as a successful repair. Agent-local checks are advisory; authoritative success always comes from the external full harness.

### 7. Preserve bounded, attributable evidence and local metrics

The controller creates a private run directory outside the repository and all worker writable roots. Suggested logical artifacts are:

```text
run-manifest.json
initial-verification/{result.json,stdout.log,stderr.log}
attempts/01/{request.json,events.jsonl,response.json,candidate.patch,policy.json}
attempts/01/verification/{result.json,stdout.log,stderr.log}
result.json
report.md
final.patch                 # only for an independently verified repair
```

The trusted parent captures streams and creates official records. Worker-written reports and model claims are untrusted inputs. Record schema version, timestamps, source/candidate hashes, CLI/model/tool versions, effective policy, allowlist, commands, signal/exit status, gate progression, attempt count, patch statistics, budget use, and terminal reason. Hash the final patch so the report identifies exactly what was checked.

Capture unfiltered subprocess evidence; RTK remains a user-facing command wrapper and must not make lossy output the sole diagnostic source or hide the actual child exit code. Cap each captured stream at 10 MiB and the complete run at 100 MiB. Truncation is explicit; if it prevents a trustworthy decision or evidence persistence fails, terminate with `operational_error`, never success.

Use restrictive artifact permissions, an explicit retention/cleanup policy, and no automatic external uploads. Do not dump environments or credentials. Sanitize sensitive values before presenting evidence to the agent or exporting a report. Record that sanitization occurred without storing the secret mapping in artifacts. Artifact cleanup is a separate explicit local action targeting only identified run directories; it must not erase active or unrelated work.

Metrics are local structured fields: initial pass rate, repair success among eligible initially failing runs, success by attempt number, escalation reasons, policy violations, durations, patch size, and token usage/cost estimates when available. Missing usage data is unknown, not zero. Human rejection of a green patch is a separately recorded outcome; optimizing only the green rate is not an objective.

### 8. Keep future CI publication separate

A later OpenSpec change may run this controller against a fixed failing SHA, with trusted control policy sourced independently of untrusted PR content. Start with manual triggering and patch/evidence artifacts only. Verify in a separate job without Codex credentials. The original CI result continues to describe the original commit; a candidate patch cannot turn it green retroactively.

Any future commit, push, PR creation, or artifact publication requires a separately authorized component and reviewed permissions. PR/fork content and downloaded artifacts remain untrusted. This proposal adds no workflow, trigger, token, GitHub write permission, or publication step.

## Risks / Trade-offs

- Strict isolation may be unsupported or slow locally -> prove the Linux adapter first and report unavailable prerequisites rather than weaken restrictions.
- Sandbox-compatible execution may expose differences such as localhost socket permissions -> include a real independent harness smoke test in the supported-platform gate.
- Narrow scopes and frozen tests reduce automatic recovery -> measure safe escalations as useful outcomes and use the regular reviewed workflow for broader fixes.
- Tests and static checks cannot prove unchanged API semantics or rule out all reward hacking -> reject obvious bypasses, retain evidence, and require human review of patches.
- Logs, code comments, or model output can contain prompt injection -> treat them as data and enforce capabilities outside the model.
- Processes, caches, symlinks, or dependency edits can contaminate verification -> terminate worker trees and reconstruct each verifier from immutable inputs.
- Fail-fast harness execution hides later failures -> record gate progression without inventing an overall failure count.
- A small green patch may be unrelated or overfit -> tie edits to recorded failures and track human rejection independently of harness success.
- Version-dependent CLI configuration can alter effective permissions -> pin/test compatibility and stop on unrecognized or ineffective controls.
- Dirty-tree refusal limits convenience -> document it clearly; do not solve it with automatic Git mutations.

## Migration Plan

1. Prove the isolation and Codex capability contract in local disposable fixtures before enabling real repair. Unsupported environments must already produce useful non-success reports.
2. Implement and test the controller with fake Codex/verifier adapters, then add real process adapters and evidence export.
3. Introduce the opt-in entrypoint and local runbook; preserve ordinary verification and all existing CI behavior.
4. Demonstrate initial pass, a permitted deterministic repair, exhausted attempts, scope denial, and isolation failure. Keep real-model smoke evidence separate from deterministic controller tests.
5. Run the repository completion gate and relevant sandbox-backed checks. Record actual results and limitations in the ADR, runbook, and affected context/status summaries.

Rollback is to stop invoking the opt-in command or revert its tooling through the ordinary reviewed workflow. There is no database, infrastructure, deployment, or product-state migration. The controller never applies candidate patches to the user's checkout.

## Open Questions

- Which Linux isolation backend and minimum versions satisfy the full worker/client credential separation and read-only oracle contract on the supported development host? Resolve this with the first implementation gate; repair remains disabled until proven.
- Which pinned Codex model/configuration will be used for the first live smoke demonstration? Record the choice and effective capabilities without selecting an unverified moving `latest` default.
- Do measured harness and repair durations justify lowering the proposed timeouts? Initial implementation uses the explicit defaults above; changes require recorded evidence.

These questions do not authorize fallback permissions, broader repair scope, or automatic CI integration.
