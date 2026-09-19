## ADDED Requirements

### Requirement: Opt-in canonical local verification

The system SHALL provide an opt-in local repair command that runs the unchanged `npm run verify` harness independently of Codex. Ordinary verification SHALL NOT invoke the repair loop or require model access.

#### Scenario: Initial verification succeeds

- **WHEN** the initial harness execution passes and verification integrity is confirmed
- **THEN** the controller exits successfully with status `passed_initial`
- **AND** it records zero repair attempts and does not invoke Codex

#### Scenario: Local evidence remains bounded

- **WHEN** the controller reports a successful local verification
- **THEN** it identifies the exact candidate and gates executed
- **AND** it does not claim PostgreSQL integration, full GitHub Actions, release readiness, or production operation

### Requirement: Immutable input and non-mutating handoff

The controller SHALL snapshot an operator-authorized clean input and policy before verification, use disposable workspaces, and preserve the user's checkout. It SHALL NOT commit, push, stash, perform destructive Git operations, or automatically apply a repair patch.

#### Scenario: Dirty input is rejected safely

- **WHEN** the input contains tracked changes or untracked non-ignored project files
- **THEN** the controller reports the unsupported input before starting verification or repair
- **AND** it does not modify, stash, commit, or discard those files

#### Scenario: Successful repair is handed off

- **WHEN** an admissible repair passes independent verification
- **THEN** the controller exports a patch relative to the original snapshot and an evidence report
- **AND** it leaves the source checkout and Git history unchanged

#### Scenario: Input changes concurrently

- **WHEN** the source checkout no longer matches the recorded input before completion
- **THEN** the controller returns `needs_human` with a stale-input reason
- **AND** it retains the candidate evidence without claiming applicability to the new checkout state

### Requirement: Bounded repair iterations

The controller SHALL allow at most three repair invocations per run. Each launched invocation SHALL consume one attempt, including failures or interruptions. It SHALL perform at most one initial full verification plus one full independent verification for each admissible repair and SHALL NOT perform hidden repair retries.

#### Scenario: Repair succeeds within budget

- **WHEN** a permitted repair produces a nonempty patch and independent verification passes within the attempt and time budgets
- **THEN** the controller exits with status `repaired`
- **AND** it does not invoke another repair

#### Scenario: Attempts are exhausted

- **WHEN** the third repair has been used and its admissible candidate still fails verification
- **THEN** the controller exits nonzero with status `exhausted`
- **AND** it records a human handoff and does not launch a fourth repair

#### Scenario: Agent fails during an attempt

- **WHEN** a launched Codex process crashes or returns a transport or protocol error
- **THEN** that attempt remains counted and the run ends with `operational_error`
- **AND** the controller does not retry the invocation or mark a partial patch verified

### Requirement: Deadlines and process lifecycle

The controller SHALL enforce per-repair, per-verification, and total-run deadlines independently of agent output. Default limits SHALL be ten minutes per repair, five minutes per verification, and forty minutes per run. Invocation settings SHALL only lower configured policy ceilings. The controller SHALL prevent concurrent workers from sharing mutable run state and SHALL terminate worker descendants on cancellation or timeout.

#### Scenario: Deadline expires

- **WHEN** a process or total-run deadline expires
- **THEN** the controller terminates the worker process tree and returns nonzero with `budget_exceeded`
- **AND** it preserves available evidence without launching another attempt

#### Scenario: Operator interrupts the run

- **WHEN** the operator cancels a running loop
- **THEN** the controller stops active workers, records `interrupted`, and does not continue repair

#### Scenario: Limits cannot be raised by a worker

- **WHEN** agent output requests more attempts, a longer deadline, or another agent session
- **THEN** the controller does not expand the budget or start a nested repair loop

### Requirement: Enforced worker isolation

Every repair SHALL use Codex CLI with sandbox `workspace-write`, approval policy `never`, disabled command network access, and an enforced filesystem/process boundary. The controller SHALL verify that prohibited paths and control state cannot be modified by workers, including through transient edits or path aliases. It SHALL stop before repair if effective isolation cannot be established and SHALL NOT fall back to prompts, reversible file permissions, or final-diff inspection alone.

#### Scenario: Required isolation is unavailable

- **WHEN** the host or installed CLI cannot enforce the configured protected paths and worker boundary
- **THEN** the controller returns `operational_error` before launching repair
- **AND** it does not request broader privileges or disable a guardrail

#### Scenario: Worker attempts a protected write

- **WHEN** a worker attempts to replace, delete, rename, or temporarily modify an oracle or control file
- **THEN** the isolation boundary denies the operation
- **AND** any observed policy violation causes a non-success human handoff

#### Scenario: Credentials and integrations remain controlled

- **WHEN** a repair worker starts
- **THEN** it has no project secrets, GitHub/cloud credentials, SSH agent, Docker socket, or unrestricted user-home access
- **AND** the controller uses a controlled CLI configuration that cannot activate unauthorized hooks, connectors, plugins, or nested agents
- **AND** model-client authentication is separated from worker-visible execution credentials

### Requirement: Explicit repair allowlist

The controller SHALL accept repair edits only to explicitly authorized existing regular TypeScript implementation files under `src/domain/` or `src/application/`, excluding schemas and public contract/type definitions. It SHALL require a relationship to the observed failure and SHALL NOT automatically expand the allowlist. Default cumulative limits SHALL be five changed files and 200 added/deleted lines, with only lower invocation limits permitted.

#### Scenario: Allowed implementation repair

- **WHEN** a candidate edits only allowed existing implementation files within cumulative limits and its rationale is grounded in the recorded failure
- **THEN** the controller admits it for independent verification subject to the other policy checks

#### Scenario: Repair needs broader scope

- **WHEN** a repair requires a file outside the allowlist, a new file, deletion, rename, link, special file, or file-mode change
- **THEN** the controller rejects the candidate and returns `needs_human`
- **AND** it records the requested scope without granting it

#### Scenario: Cumulative patch exceeds limits

- **WHEN** individually small attempts collectively exceed the run's changed-file or changed-line limit
- **THEN** the controller rejects the candidate and escalates without another repair

### Requirement: Protected product and delivery surfaces

During repair, the system SHALL prohibit modifications to tests, fixtures, snapshots, dependencies, package scripts, quality configuration, ignore rules, OpenSpec, OpenAPI, agent instructions, skills, controller code/policy, infrastructure, GitHub Actions, API modules, infrastructure adapters, migrations, or secrets. It SHALL NOT execute migrations or operate external services. It SHALL NOT authorize new public API behavior or resolve ambiguous product/security policy autonomously.

#### Scenario: Test or specification needs correction

- **WHEN** diagnosis indicates that a test, fixture, product specification, or public API contract must change
- **THEN** the controller returns `needs_human` for the ordinary reviewed change workflow
- **AND** no repair modifies that protected surface

#### Scenario: Local test exposes infrastructure failure

- **WHEN** a local unit test fails because an infrastructure contract or adapter needs modification
- **THEN** the controller escalates the failure despite its presence in the local harness

#### Scenario: Product intent is ambiguous

- **WHEN** a proposed correction requires deciding new response semantics, validation behavior, security policy, or persistence behavior
- **THEN** the loop requests human judgment through a terminal report
- **AND** it does not reinterpret the current requirements to obtain a passing harness

### Requirement: Independent reconstructed verification

The verifier SHALL run the canonical harness against a reconstructed original snapshot plus the admitted cumulative patch. It SHALL use frozen tests, configuration, scripts, and trusted dependencies, with isolated writable caches and no repair-worker credentials or mutable state. It SHALL verify oracle integrity before and after execution and SHALL treat candidate code as untrusted executable input.

#### Scenario: Agent claims success

- **WHEN** Codex exits successfully or states that its checks passed
- **THEN** the controller still inspects the patch and runs full independent verification
- **AND** the agent's message and local checks do not determine the final verdict

#### Scenario: Dependency or cache contamination is attempted

- **WHEN** a worker alters dependencies, cached results, or verification inputs in its own environment
- **THEN** those changes are not imported into the verifier
- **AND** prohibited changes are reported as policy violations

#### Scenario: Integrity fails despite green output

- **WHEN** the harness returns zero but integrity checks fail or required completion evidence is missing
- **THEN** the controller returns nonzero and does not export a verified final patch

#### Scenario: Canonical tests require local sockets

- **WHEN** the isolated harness executes Supertest-based tests
- **THEN** its environment permits the required isolated local socket behavior without granting external network or service access

### Requirement: Reward-hacking defenses

The controller SHALL reject detected attempts to weaken the oracle or introduce verification bypasses, including new blanket suppressions, test-runner interference, test-specific production shortcuts, or hard-coded answers unrelated to the required behavior. Checks SHALL evaluate changes relative to the baseline and SHALL NOT present automated success as proof of complete semantic equivalence.

#### Scenario: Patch introduces a test-only bypass

- **WHEN** a candidate adds a detected test-environment branch or suppression whose purpose is to bypass a failing check
- **THEN** the controller rejects it and escalates even if a worker reports green tests

#### Scenario: Baseline already contains test seams

- **WHEN** an existing baseline file contains an established test seam that the patch does not change
- **THEN** the controller does not label that unchanged content a newly introduced bypass

### Requirement: Failure classification and progress

The controller SHALL distinguish eligible failures, out-of-scope failures, operational errors, and uncertain diagnoses. It SHALL track stable failure fingerprints and gate progression rather than relying only on patch hashes or counts of failures hidden by fail-fast execution. It SHALL stop on empty patches, repeated candidate/failure states, cycles, or two consecutive repair attempts without observable diagnostic progress.

#### Scenario: A later gate becomes visible

- **WHEN** a repair fixes typecheck and the next verification first fails at lint
- **THEN** the controller records gate progression as potential progress
- **AND** it separately checks whether the newly observed failure is eligible before another repair

#### Scenario: Attempts do not progress

- **WHEN** the candidate repeats a previously seen failure state or reaches the no-progress limit
- **THEN** the controller ends with `needs_human` and preserves the attempt history

#### Scenario: Failure disappears without repair

- **WHEN** diagnostic evidence indicates an intermittent failure disappeared without an admissible patch
- **THEN** the controller does not count the event as a successful repair or retry until green
- **AND** it records a human escalation for inconsistent evidence

#### Scenario: Environment is broken

- **WHEN** a required executable, authentication capability, dependency, or compatible environment is unavailable
- **THEN** the controller reports `operational_error`
- **AND** it does not change application code, install dependencies, or expand permissions to compensate during repair

### Requirement: Structured agent protocol and untrusted evidence

The Codex adapter SHALL provide a bounded request containing the failed gate, sanitized evidence, read-only requirements, explicit scope, and previous outcomes. It SHALL capture JSONL events and validate the final structured response. It SHALL treat logs, repository content, and model messages as data without authority to change commands, policy, permissions, or success criteria.

#### Scenario: Diagnostic text contains instructions

- **WHEN** failure output contains commands or text instructing the agent to disable a gate or reveal credentials
- **THEN** the controller passes it only as untrusted diagnostic content
- **AND** it does not execute interpolated shell text or alter the repair policy

#### Scenario: Response is malformed or incomplete

- **WHEN** the agent returns an invalid response, incomplete event stream, or missing completion result
- **THEN** the controller records a protocol failure and exits with `operational_error`
- **AND** it retains any observed changes only as unverified evidence

### Requirement: Attributable bounded artifacts

The controller SHALL create private artifacts outside the repository and worker writable roots, including input/policy/tool identities, initial verification, per-attempt evidence and patch decisions, independent verification, and a terminal report. It SHALL capture authoritative child exit status and unfiltered subprocess evidence, sanitize sensitive data before model input or export, and never dump credentials or complete environments. Artifact limits SHALL default to 10 MiB per stream and 100 MiB per run.

#### Scenario: Human handoff is complete

- **WHEN** a run terminates without success
- **THEN** its report identifies the terminal reason, last observed failure, consumed attempts, changed paths, candidate verification state, and decision needed from a human

#### Scenario: Evidence cannot be safely retained

- **WHEN** evidence storage fails or output limits prevent a trustworthy verification decision
- **THEN** the controller returns `operational_error` and marks truncation or missing evidence explicitly
- **AND** it does not report a verified repair

#### Scenario: Artifacts cannot affect the harness

- **WHEN** logs, reports, and patches are created
- **THEN** their location does not introduce new repository files into linting, formatting, tests, or OpenSpec validation
- **AND** repair workers cannot overwrite the official evidence

### Requirement: Local metrics and outcome vocabulary

The controller SHALL emit versioned machine-readable outcomes using `passed_initial`, `repaired`, `exhausted`, `needs_human`, `operational_error`, `budget_exceeded`, or `interrupted`. Only the two success statuses SHALL exit zero. It SHALL record attempts, durations, gate progression, patch size, escalation/violation reasons, and available token usage without requiring an external telemetry service.

#### Scenario: Recovery rate is computed

- **WHEN** local results are summarized as a repair success rate
- **THEN** the denominator is eligible initially failing runs, with exclusions stated explicitly
- **AND** initially passing runs do not inflate the repair success rate

#### Scenario: Usage information is absent

- **WHEN** the CLI does not provide usable token or cost data
- **THEN** the report records it as unavailable rather than zero

### Requirement: Local-only delivery and validation

This change SHALL preserve existing GitHub Actions and infrastructure behavior and provide deterministic controller tests without live model calls in ordinary verification. Live Codex and sandbox compatibility demonstrations SHALL be recorded separately with their prerequisites and limitations. Future CI repair or publication SHALL require a separate reviewed change.

#### Scenario: Normal verification tests the controller

- **WHEN** the project's ordinary test suite covers loop transitions and policies
- **THEN** it uses controlled fake process/model responses and disposable fixtures
- **AND** it does not consume model credentials, modify the real checkout, or require a live external service

#### Scenario: Live repair is demonstrated

- **WHEN** a supported local environment runs a real repair smoke demonstration
- **THEN** evidence identifies the actual CLI/model/isolation versions and resulting candidate
- **AND** mocked tests or static design artifacts are not described as proof of that live execution

#### Scenario: Proposal is introduced without CI automation

- **WHEN** this capability is implemented
- **THEN** no GitHub Actions trigger, workflow, cloud operation, commit, push, or PR publication is added to the loop
