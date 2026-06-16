## Why

Protected administrative operations currently have authentication but no documented request-volume control. Adding rate limiting now closes that product gap and creates a concrete gateway/application boundary exercise before deeper local platform work.

## What Changes

- Add documented rate-limit behavior for protected administrative API requests.
- Use a local-development default of 60 protected admin requests per minute per authenticated admin identity.
- Preserve existing authentication behavior: requests with missing or invalid admin credentials continue to fail with the documented authentication response instead of a rate-limit response.
- Return HTTP `429` with a generic documented error payload when a valid authenticated admin identity exceeds the configured limit.
- Include deterministic recovery guidance, such as `Retry-After`, when the implementation can compute it.
- Keep operational endpoints such as `/health`, `/healthz`, `/readyz`, and `/metrics` outside the admin rate limit.
- Document local configuration and validation for allowed, limited, and reset/recovery scenarios.

## Capabilities

### New Capabilities

- `admin-api-rate-limiting`: Rate-limit behavior for protected administrative API requests, including identity association, allowed/limited responses, reset behavior, and operational endpoint exclusions.

### Modified Capabilities

- `api-contract`: Documents HTTP `429` responses and recovery headers for protected administrative operations.
- `admin-api-authentication`: Clarifies that authentication failure takes precedence over rate-limit enforcement for missing or invalid admin credentials.

## Impact

- Affects protected admin routes: `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- Does not change feature flag evaluation semantics, audit event construction, or PostgreSQL persistence behavior.
- May affect local gateway configuration or application middleware depending on the selected enforcement boundary.
- Requires tests or smoke checks for allow, deny, and reset/recovery behavior, plus documentation for local validation.
