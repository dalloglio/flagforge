## Why

FlagForge currently supports all-or-nothing enabled flags and simple context rules, but it cannot gradually expose a feature to a stable subset of users. Percentage rollout adds the next practical feature-flag capability while keeping evaluation deterministic and small enough for the current API.

## What Changes

- Add optional percentage rollout configuration to feature flags.
- Allow clients to create and update flags with a rollout percentage and rollout context attribute.
- Evaluate rollout-enabled flags deterministically using the flag key and caller-provided context value for the rollout attribute.
- Return explicit evaluation reasons for rollout matches, rollout misses, and missing rollout attributes.
- Preserve existing flag behavior for flags without rollout configuration.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `flags-api`: Feature flag create, read, list, and update behavior will include optional rollout configuration in the public flag payload.
- `flag-evaluation`: Evaluation will apply deterministic percentage rollout after enabled-state and rule matching decisions.

## Impact

- Updates domain types and Zod schemas for feature flag payloads.
- Updates the pure evaluator to support deterministic bucketing.
- Updates API tests and evaluator tests for rollout validation and evaluation outcomes.
- No persistence, authentication, tenancy, SDK, or external dependency changes are expected.
