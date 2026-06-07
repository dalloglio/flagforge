## MODIFIED Requirements

### Requirement: Evaluate feature flag
The system SHALL allow clients to evaluate a PostgreSQL-persisted feature flag by key using a caller-provided context object.

#### Scenario: Enabled flag without rules evaluates true
- **WHEN** a client evaluates an existing flag that is enabled and has no rules
- **THEN** the system responds with HTTP 200 and `enabled` equal to `true`

#### Scenario: Disabled flag evaluates false
- **WHEN** a client evaluates an existing flag that is disabled
- **THEN** the system responds with HTTP 200 and `enabled` equal to `false`

#### Scenario: Persisted flag evaluates after restart
- **WHEN** a client evaluates a flag that was persisted before an application or repository restart
- **THEN** the system responds according to the same enabled-state, targeting-rule, and rollout behavior used before restart

#### Scenario: Missing flag evaluation returns not found
- **WHEN** a client sends `POST /flags/{key}/evaluate` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

#### Scenario: Invalid evaluation payload is rejected
- **WHEN** a client sends `POST /flags/{key}/evaluate` with an invalid evaluation payload
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: Evaluate percentage rollout
The system SHALL support optional percentage rollout configuration that deterministically enables a flag for a stable subset of eligible evaluation contexts, including after the flag has been persisted in PostgreSQL and read in a later application lifecycle.

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

#### Scenario: Rollout decision is stable after restart
- **WHEN** a flag with rollout configuration is persisted and the same context is evaluated before and after an application or repository restart
- **THEN** the rollout decision and reason are unchanged
