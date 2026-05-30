## MODIFIED Requirements

### Requirement: Evaluation result explains decision

The system SHALL include a reason in every successful evaluation response.

#### Scenario: Evaluation reason is returned

- **WHEN** a client successfully evaluates a flag
- **THEN** the system responds with a JSON body containing `key`, `enabled`, and `reason`

#### Scenario: Rollout evaluation reason is returned

- **WHEN** a client successfully evaluates a flag with rollout configuration
- **THEN** the system responds with a JSON body containing `key`, `enabled`, and a rollout-specific `reason` when rollout determines the result

## ADDED Requirements

### Requirement: Evaluate percentage rollout

The system SHALL support optional percentage rollout configuration that deterministically enables a flag for a stable subset of eligible evaluation contexts.

#### Scenario: Rollout includes context

- **WHEN** an enabled flag has rollout percentage greater than `0` and the context attribute value hashes into the included rollout bucket range
- **THEN** the evaluation result has `enabled` equal to `true` and `reason` equal to `in_rollout`

#### Scenario: Rollout excludes context

- **WHEN** an enabled flag has rollout percentage less than `100` and the context attribute value hashes outside the included rollout bucket range
- **THEN** the evaluation result has `enabled` equal to `false` and `reason` equal to `not_in_rollout`

#### Scenario: Zero percent rollout excludes all contexts

- **WHEN** an enabled flag has rollout percentage `0` and the evaluation context contains the rollout attribute
- **THEN** the evaluation result has `enabled` equal to `false` and `reason` equal to `not_in_rollout`

#### Scenario: Full rollout includes all contexts

- **WHEN** an enabled flag has rollout percentage `100` and the evaluation context contains the rollout attribute
- **THEN** the evaluation result has `enabled` equal to `true` and `reason` equal to `in_rollout`

#### Scenario: Missing rollout attribute evaluates false

- **WHEN** an enabled flag has rollout configuration and the evaluation context does not contain the configured rollout attribute
- **THEN** the evaluation result has `enabled` equal to `false` and `reason` equal to `missing_rollout_attribute`

#### Scenario: Rollout applies after rule match

- **WHEN** an enabled flag has matching rules and rollout configuration
- **THEN** the evaluation result is determined by the rollout bucket decision

#### Scenario: Rollout is skipped when rules do not match

- **WHEN** an enabled flag has non-matching rules and rollout configuration
- **THEN** the evaluation result has `enabled` equal to `false` and `reason` equal to `no_matching_rule`
