## ADDED Requirements

### Requirement: Independent bounded local repair loop

The system SHALL provide an opt-in local controller that runs the unchanged canonical `npm run verify` as V0 and invokes Codex only when the observed failure is eligible for bounded repair. The controller, not Codex, SHALL own attempt counts, termination, candidate admission, verification, and final status. A run SHALL use no more than three repair invocations and SHALL run a fresh authoritative verifier after every admitted candidate.

#### Scenario: Repository is already green

- **WHEN** V0 succeeds and verification inputs remain intact
- **THEN** the controller returns `passed_initial`
- **AND** it does not invoke Codex

#### Scenario: Candidate repair succeeds

- **WHEN** an eligible failure receives an admissible non-empty implementation patch
- **AND** a fresh reconstructed candidate passes the canonical verifier
- **THEN** the controller returns `repaired`
- **AND** Codex's own success claim is not used as the verdict

#### Scenario: Attempts are exhausted

- **WHEN** three repair invocations are consumed without verified success
- **THEN** the controller returns `exhausted`
- **AND** it preserves attempt evidence for human review

### Requirement: Frozen independent verification

The controller SHALL treat the original tests, fixtures, package inputs, quality configuration, OpenAPI, OpenSpec, agent instructions, controller policy, infrastructure/delivery definitions, and verifier command as protected verification inputs. Candidate verification SHALL reconstruct the original baseline plus only admitted implementation edits and SHALL execute the unchanged `npm run verify`.

#### Scenario: Agent claims success

- **WHEN** Codex exits successfully or reports that its focused checks passed
- **THEN** the controller still performs independent reconstructed verification
- **AND** only the verifier result can produce `repaired`

#### Scenario: Candidate changes a protected input

- **WHEN** a repair workspace changes a protected test, specification, configuration, dependency input, delivery file, or controller policy
- **THEN** the controller rejects that candidate
- **AND** those edits are not imported into the verifier reconstruction

### Requirement: Conservative Phase 1 repair scope

For the functional MVP, the controller SHALL use deterministic file-level admission. It SHALL accept repair edits only to operator-authorized existing regular TypeScript implementation files under `src/domain/**` or `src/application/**`, and a reviewed protected-file denylist SHALL always take precedence. The initial denylist SHALL include `src/domain/schemas.ts`, `src/domain/repository.ts`, `src/domain/audit-log.ts`, and `src/application/flag-use-cases.ts` because those files contain protected validation/contracts/types or mix those declarations with implementation. Phase 1 SHALL NOT attempt declaration-aware edits within a denied mixed file. The default cumulative limit SHALL be five files and 200 added/deleted lines. New files, deletion, rename, file-mode changes, links, and special files SHALL be rejected.

#### Scenario: Repair stays inside authorized scope

- **WHEN** a candidate changes only authorized implementation files within the configured limits
- **AND** its rationale is related to the observed failure
- **THEN** the candidate is eligible for reconstructed verification

#### Scenario: Repair requires broader scope

- **WHEN** a candidate requires an API module, infrastructure adapter, migration, dependency, test, spec, quality configuration, denied mixed source file, or any unauthorized path
- **THEN** the controller rejects the candidate
- **AND** returns `needs_human` rather than broadening scope automatically

#### Scenario: Mixed source file contains contract and implementation

- **WHEN** the diagnosed implementation defect is located in a protected file that also contains contract/type declarations
- **THEN** the Phase 1 controller rejects repair edits to that entire file
- **AND** returns `needs_human` instead of trying to distinguish declarations from implementation automatically

### Requirement: Human judgment boundary

The loop SHALL NOT decide new product, API, security, persistence, infrastructure, or test/spec semantics. When a correct repair requires changing such a decision or artifact, the controller SHALL end with `needs_human`.

#### Scenario: Test or specification must change

- **WHEN** diagnosis shows that the existing test, fixture, OpenSpec requirement, or OpenAPI contract is the artifact that needs correction
- **THEN** the controller returns `needs_human`
- **AND** the autonomous repair path leaves that artifact unchanged

#### Scenario: Product intent is ambiguous

- **WHEN** multiple implementation outcomes are plausible and existing requirements do not determine the intended behavior
- **THEN** the controller returns `needs_human`
- **AND** Codex does not invent semantics to obtain a green harness

### Requirement: Progress-aware termination

The controller SHALL track the failed gate, normalized diagnostic fingerprint, candidate identity, and gate progression. It SHALL stop on empty patches, repeated candidate/failure states, detected cycles, or two consecutive attempts without observable diagnostic progress.

#### Scenario: Verification advances to a later gate

- **WHEN** a candidate fixes the current gate and the next full verifier first fails at a later gate
- **THEN** the controller records gate progression as potential progress
- **AND** reclassifies the newly observed failure before another repair

#### Scenario: Repair does not progress

- **WHEN** the same failure state repeats or the no-progress threshold is reached
- **THEN** the controller returns `needs_human`
- **AND** does not continue merely because attempts remain

### Requirement: Structured Codex invocation

The controller SHALL invoke Codex in non-interactive mode using a bounded request that includes the failed gate, sanitized evidence, explicit repair scope, relevant read-only context, prior outcomes, and fixed repair rules. Phase 1 SHALL use `workspace-write` and approval policy `never`. Codex output SHALL be treated as untrusted proposal data.

#### Scenario: Diagnostic output contains instructions

- **WHEN** a failing log contains text instructing the agent or controller to weaken verification, expose credentials, or expand permissions
- **THEN** that text is treated only as diagnostic data
- **AND** it cannot modify controller policy or success criteria

#### Scenario: Agent protocol is unusable

- **WHEN** the selected Codex CLI cannot provide the required structured completion evidence
- **THEN** the controller returns `operational_error`
- **AND** it does not silently weaken the protocol

### Requirement: Patch-only local handoff

A successful local run SHALL produce a hash-identified patch and evidence packet without automatically applying the patch to the user's checkout, committing, pushing, opening a pull request, or modifying Git history.

#### Scenario: Verified patch is ready

- **WHEN** a candidate passes policy and independent verification
- **THEN** the controller exports the verified patch and terminal report
- **AND** a human remains responsible for reviewing and applying the patch

#### Scenario: Source checkout changed during the run

- **WHEN** the user's recorded source input no longer matches the original baseline at completion
- **THEN** the controller reports stale input
- **AND** does not automatically apply the candidate

### Requirement: Functional experiment evidence

Phase 1 SHALL include deterministic tests and controlled experiments covering both repair and escalation behavior. Ordinary automated tests SHALL use fake verifier/Codex adapters and SHALL not require live model credentials.

#### Scenario: Repairable implementation defect

- **WHEN** a controlled fixture introduces an eligible TypeScript, lint/format, or unit-test implementation failure
- **THEN** the experiment records whether the loop converges within its attempt budget
- **AND** the final verdict comes from independent verification

#### Scenario: Non-repairable failure

- **WHEN** a controlled fixture requires a test/spec/API/infrastructure decision or attempts a protected-file modification
- **THEN** the expected result is rejection or `needs_human`
- **AND** success-rate metrics do not count that escalation as a repaired failure

#### Scenario: Live demonstration

- **WHEN** Phase 1 is claimed complete
- **THEN** at least one supported local run uses the real Codex CLI
- **AND** its tool versions, input failure, attempts, candidate, verifier result, and limitations are recorded separately from mocked tests

### Requirement: Local metrics and outcomes

The controller SHALL emit versioned machine-readable outcomes using `passed_initial`, `repaired`, `exhausted`, `needs_human`, `operational_error`, `budget_exceeded`, or `interrupted`. Only `passed_initial` and `repaired` SHALL exit zero. Evidence SHALL record attempts, duration, gate progression, patch statistics, escalation/policy reasons, and available usage data.

#### Scenario: Repair success rate is computed

- **WHEN** local repair outcomes are summarized
- **THEN** the denominator is eligible initially failing runs
- **AND** initially green runs and explicitly ineligible failures are identified separately

#### Scenario: Usage data is unavailable

- **WHEN** the selected Codex CLI does not expose usable token/cost data
- **THEN** the report records the value as unavailable rather than zero

### Requirement: Phase 2 hardening preserves the loop contract

After the functional MVP is demonstrated, the implementation SHALL support a hardening phase for unattended local execution. The first hardening target SHALL be Linux and SHALL evaluate OS-enforced protection of verification/controller state, worker process termination, credential/network boundaries, scoped scratch/caches, path-alias defenses, and Codex extension surfaces. Unsupported hardening environments SHALL fail closed.

#### Scenario: Hardening prerequisite is unavailable

- **WHEN** the selected platform cannot enforce the required hardened execution boundary
- **THEN** the hardened live path returns `operational_error`
- **AND** it does not fall back to prompt-only or diff-only claims of equivalent isolation

#### Scenario: Hardened candidate passes

- **WHEN** Phase 2 isolation succeeds and the reconstructed verifier returns green
- **THEN** the result still uses the same `repaired` success semantics
- **AND** the hardening layer does not make Codex the success authority

### Requirement: CI automation remains future scope

This change SHALL NOT add a GitHub Actions repair trigger, automated branch/commit/push behavior, PR mutation, or automatic external artifact publication.

#### Scenario: Local capability is implemented

- **WHEN** the local controller is delivered
- **THEN** existing GitHub Actions behavior remains unchanged
- **AND** CI repair requires a separate reviewed OpenSpec change
