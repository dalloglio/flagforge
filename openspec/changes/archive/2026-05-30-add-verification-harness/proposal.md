## Why

FlagForge needs a single predictable verification harness that agents and developers can run before considering work complete. The current local and CI checks are useful, but they are split across commands and do not include OpenSpec validation.

## What Changes

- Add a local npm verification command that runs the project quality gates in one sequence.
- Add a non-mutating formatting check for verification while keeping the existing formatting command available for fixes.
- Include strict OpenSpec validation in the verification harness.
- Update CI so OpenSpec validation is part of the required quality gate, using JSON output where appropriate for automation.
- Update repository guidance so agents run the verification harness before marking implementation tasks done and only fix failures directly related to the current change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ci-quality`: Extend local quality scripts and CI requirements to include a unified verification harness and strict OpenSpec validation.

## Impact

- `package.json` scripts for local verification and formatting checks.
- GitHub Actions workflow quality steps.
- Repository guidance for agent/developer completion behavior.
- OpenSpec `ci-quality` requirements.
