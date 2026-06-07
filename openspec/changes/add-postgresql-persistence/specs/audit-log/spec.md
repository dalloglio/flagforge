## MODIFIED Requirements

### Requirement: Record flag mutation audit events
The system SHALL record a durable PostgreSQL audit event for each successful feature flag mutation.

#### Scenario: Create flag records audit event
- **WHEN** a client successfully creates a feature flag with `POST /flags`
- **THEN** the system records an audit event with action `flag_created`, the created flag key, an event ID, an ISO timestamp, no `before` flag state, and the created flag as `after`

#### Scenario: Update flag records audit event
- **WHEN** a client successfully updates a feature flag with `PATCH /flags/{key}`
- **THEN** the system records an audit event with action `flag_updated`, the updated flag key, an event ID, an ISO timestamp, the previous flag as `before`, and the updated flag as `after`

#### Scenario: Persisted mutation and audit event survive together
- **WHEN** a successful create or update mutation is committed and the application or repository is restarted against the same PostgreSQL database
- **THEN** the changed flag state and its corresponding audit event are both still available

#### Scenario: Rejected create does not record audit event
- **WHEN** a client sends `POST /flags` with an invalid payload or duplicate key
- **THEN** the system does not record an audit event for that request

#### Scenario: Rejected update does not record audit event
- **WHEN** a client sends `PATCH /flags/{key}` with an invalid payload or a key that does not exist
- **THEN** the system does not record an audit event for that request

### Requirement: List audit events
The system SHALL expose recorded PostgreSQL audit events through a read-only HTTP endpoint.

#### Scenario: Audit events are listed
- **WHEN** a client sends `GET /audit-log`
- **THEN** the system responds with HTTP 200 and a JSON array of audit events ordered from oldest to newest

#### Scenario: Persisted audit events are listed after restart
- **WHEN** audit events were recorded before an application or repository restart
- **THEN** `GET /audit-log` responds with those persisted audit events ordered from oldest to newest

#### Scenario: Empty audit log is listed
- **WHEN** a client sends `GET /audit-log` before any successful feature flag mutation
- **THEN** the system responds with HTTP 200 and an empty JSON array

#### Scenario: Audit events can be filtered by flag key
- **WHEN** a client sends `GET /audit-log?flagKey={key}`
- **THEN** the system responds with HTTP 200 and a JSON array containing only audit events for the requested flag key ordered from oldest to newest

#### Scenario: Persisted audit events can be filtered after restart
- **WHEN** audit events for multiple flags were recorded before an application or repository restart
- **THEN** `GET /audit-log?flagKey={key}` returns only persisted events for the requested flag key ordered from oldest to newest

#### Scenario: Invalid audit log filter is rejected
- **WHEN** a client sends `GET /audit-log` with an invalid `flagKey` query value
- **THEN** the system responds with HTTP 400 and validation error details

### Requirement: Preserve audit event snapshots
The system SHALL preserve audit event flag snapshots as they existed when each mutation was recorded, including after those snapshots are persisted in PostgreSQL.

#### Scenario: Later updates do not mutate earlier audit events
- **WHEN** a feature flag is created and then updated
- **THEN** the audit event for the create operation still contains the originally created flag state

#### Scenario: Persisted snapshots remain immutable after restart
- **WHEN** an audit event is persisted with `before` and `after` snapshots and the flag is updated in a later application or repository lifecycle
- **THEN** the earlier audit event snapshots remain unchanged
