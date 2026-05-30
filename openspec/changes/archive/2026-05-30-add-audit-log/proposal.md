## Why

FlagForge currently lets clients create and update feature flags, but it does not retain an operational history of who or what changed flag configuration. An audit log makes flag changes inspectable and gives future API work a foundation for accountability without introducing authentication or persistence yet.

## What Changes

- Add an audit log capability that records feature flag change events for create and update operations.
- Expose audit log entries through HTTP so clients can inspect recent flag change history.
- Include enough event detail to identify the action, affected flag key, timestamp, and before/after flag state where applicable.
- Keep storage in-memory for this change, matching the current repository model.
- Do not introduce authentication, authorization, tenancy, or durable persistence as part of this change.
- Do not change existing feature flag response bodies or evaluation behavior.

## Capabilities

### New Capabilities

- `audit-log`: Defines how FlagForge records and exposes audit events for feature flag mutations.

### Modified Capabilities

None.

## Impact

- Affected API surface: new audit log HTTP endpoint or endpoints.
- Affected domain code: new audit event types, schemas, and in-memory audit log repository behavior.
- Affected existing write paths: feature flag create and update operations append audit events after successful mutations.
- Affected tests: API coverage for audit log retrieval and domain coverage for recorded audit event contents.
- No new external dependencies are expected.
