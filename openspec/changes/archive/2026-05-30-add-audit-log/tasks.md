## 1. Domain Model

- [x] 1.1 Add audit event types for `flag_created` and `flag_updated` with ID, timestamp, flag key, `before`, and `after` fields.
- [x] 1.2 Implement an in-memory `AuditLogRepository` that appends events, lists events oldest to newest, filters by flag key, and returns cloned snapshots.
- [x] 1.3 Add deterministic clock and event ID dependency hooks for audit event creation.

## 2. API Integration

- [x] 2.1 Extend app dependencies to accept an audit log repository and audit event metadata generators.
- [x] 2.2 Record a `flag_created` audit event only after successful `POST /flags` mutations.
- [x] 2.3 Record a `flag_updated` audit event only after successful `PATCH /flags/{key}` mutations, including the previous and updated flag snapshots.
- [x] 2.4 Add `GET /audit-log` with optional `flagKey` query filtering and validation.
- [x] 2.5 Preserve existing feature flag management and evaluation response bodies.

## 3. Tests

- [x] 3.1 Add domain tests for audit log append, ordering, filtering, and snapshot immutability.
- [x] 3.2 Add API tests for listing an empty audit log.
- [x] 3.3 Add API tests proving successful create and update requests produce expected audit events.
- [x] 3.4 Add API tests proving invalid, duplicate, and not-found mutations do not produce audit events.
- [x] 3.5 Add API tests for `flagKey` query filtering and invalid filter validation.

## 4. Verification

- [x] 4.1 Run focused tests for audit log behavior while iterating.
- [x] 4.2 Run `npm run verify` before considering implementation complete.
