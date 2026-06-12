## Why

FlagForge's public HTTP contract is currently inferred from route code, tests, and OpenSpec specs, which makes API review, QA, and future gateway or client work harder than it needs to be. A source-controlled OpenAPI contract gives contributors one machine-readable contract for the existing API surface without changing runtime behavior.

## What Changes

- Add a maintained OpenAPI contract for the current public HTTP API surface.
- Document paths, request bodies, response bodies, status codes, parameters, and the standard error response shape for existing endpoints.
- Cover the current health, flag management, flag evaluation, and audit-log endpoints.
- Add a repeatable validation command that detects malformed OpenAPI syntax locally and in CI.
- Document how contributors validate and view the OpenAPI contract.
- Preserve existing endpoint behavior, persistence behavior, status codes, and response shapes.

## Capabilities

### New Capabilities

- `api-contract`: Defines the source-controlled OpenAPI contract and contributor documentation for viewing and validating the current HTTP API.

### Modified Capabilities

- `ci-quality`: Adds the OpenAPI validation command to the local and CI quality gates.

## Impact

- Adds source-controlled API contract documentation, likely under a dedicated documentation or API contract path.
- Updates package scripts and CI workflow to validate the OpenAPI contract.
- Updates contributor documentation with contract validation and viewing instructions.
- May add a lightweight OpenAPI validation dependency or reuse an existing tool if available.
- Does not change Express route behavior, domain schemas, PostgreSQL persistence, audit-log semantics, or flag evaluation semantics.
