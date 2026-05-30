## 1. Domain Model and Validation

- [x] 1.1 Add rollout configuration and rollout-specific evaluation reasons to domain types.
- [x] 1.2 Extend create and update Zod schemas to validate optional rollout configuration with integer percentage `0` through `100` and non-empty attribute.
- [x] 1.3 Ensure repository cloning preserves optional rollout configuration without changing existing flag behavior.

## 2. Evaluation Behavior

- [x] 2.1 Add deterministic bucket calculation from flag key and normalized rollout context value.
- [x] 2.2 Apply rollout after disabled-state and rule matching decisions.
- [x] 2.3 Return `in_rollout`, `not_in_rollout`, and `missing_rollout_attribute` reasons for rollout-controlled outcomes.
- [x] 2.4 Preserve existing evaluation results for flags without rollout configuration.

## 3. API Coverage

- [x] 3.1 Update create flag API behavior to accept and return valid rollout configuration.
- [x] 3.2 Update update flag API behavior to accept and return valid rollout configuration.
- [x] 3.3 Reject invalid rollout configuration on create and update requests with validation errors.

## 4. Tests and Verification

- [x] 4.1 Add evaluator tests for included rollout, excluded rollout, zero percent, full rollout, missing rollout attribute, and rule-gated rollout.
- [x] 4.2 Add API tests for creating, updating, and rejecting flags with rollout configuration.
- [x] 4.3 Run `npm run verify` and fix failures related to this change.
- [x] 4.4 Run `openspec validate add-percentage-rollout --strict` before implementation is considered ready for archive.
