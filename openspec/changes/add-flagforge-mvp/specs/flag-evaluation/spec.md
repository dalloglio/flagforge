## ADDED Requirements

### Requirement: Evaluate feature flag
The system SHALL allow clients to evaluate a feature flag by key using a caller-provided context object.

#### Scenario: Enabled flag without rules evaluates true
- **WHEN** a client evaluates an existing flag that is enabled and has no rules
- **THEN** the system responds with HTTP 200 and `enabled` equal to `true`

#### Scenario: Disabled flag evaluates false
- **WHEN** a client evaluates an existing flag that is disabled
- **THEN** the system responds with HTTP 200 and `enabled` equal to `false`

#### Scenario: Missing flag evaluation returns not found
- **WHEN** a client sends `POST /flags/{key}/evaluate` for a flag that does not exist
- **THEN** the system responds with HTTP 404 and an error describing the missing flag

#### Scenario: Invalid evaluation payload is rejected
- **WHEN** a client sends `POST /flags/{key}/evaluate` with an invalid evaluation payload
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: Match equals rules
The system SHALL support `equals` rules that match when the context attribute value is equal to the configured rule value.

#### Scenario: Equals rule matches
- **WHEN** an enabled flag has an `equals` rule for `plan` equal to `pro` and the evaluation context contains `plan` equal to `pro`
- **THEN** the evaluation result has `enabled` equal to `true` and `reason` equal to `matched_rule`

#### Scenario: Equals rule does not match
- **WHEN** an enabled flag has an `equals` rule for `plan` equal to `pro` and the evaluation context contains `plan` equal to `free`
- **THEN** the evaluation result has `enabled` equal to `false` and `reason` equal to `no_matching_rule`

### Requirement: Match in rules
The system SHALL support `in` rules that match when the context attribute value is contained in the configured list of values.

#### Scenario: In rule matches
- **WHEN** an enabled flag has an `in` rule for `country` containing `BR` and `US` and the evaluation context contains `country` equal to `BR`
- **THEN** the evaluation result has `enabled` equal to `true` and `reason` equal to `matched_rule`

#### Scenario: In rule does not match
- **WHEN** an enabled flag has an `in` rule for `country` containing `BR` and `US` and the evaluation context contains `country` equal to `DE`
- **THEN** the evaluation result has `enabled` equal to `false` and `reason` equal to `no_matching_rule`

### Requirement: Evaluation result explains decision
The system SHALL include a reason in every successful evaluation response.

#### Scenario: Evaluation reason is returned
- **WHEN** a client successfully evaluates a flag
- **THEN** the system responds with a JSON body containing `key`, `enabled`, and `reason`
