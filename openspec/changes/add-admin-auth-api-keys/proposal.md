## Why

FlagForge exposes administrative flag and audit operations without an application-level authentication boundary. Adding a simple admin API key now protects global administrative data and creates a clear upstream contract before future Kong, rate-limiting, and identity-aware platform work.

## What Changes

- Add API key authentication for administrative endpoints using the `X-Admin-API-Key` request header.
- Require one configured admin API key from `ADMIN_API_KEY`.
- Fail application startup outside tests when `ADMIN_API_KEY` is not configured.
- Protect `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- Keep operational endpoints such as `GET /health`, future liveness/readiness endpoints, and metrics endpoints accessible without the admin API key.
- Return HTTP `401 Unauthorized` with a generic error response for missing or invalid admin API keys.
- Reject or ignore query parameter API keys and do not document them as supported.
- Update OpenAPI and developer documentation to describe the authentication requirement and local configuration with non-secret example values.
- Preserve domain independence from HTTP headers, secrets, Kong, Kubernetes, cloud secret stores, user accounts, RBAC, OAuth/OIDC, rate limiting, key rotation, and multi-tenancy.
- **BREAKING**: Existing callers of protected endpoints must include a valid `X-Admin-API-Key` header.

## Capabilities

### New Capabilities

- `admin-api-authentication`: Defines admin API key configuration, protected endpoint behavior, authentication failure responses, and unauthenticated operational endpoints.

### Modified Capabilities

- `api-contract`: Documents the admin API key security scheme, protected operations, and `401 Unauthorized` responses in the source-controlled OpenAPI contract.
- `flags-api`: Requires valid admin authentication for flag create, list, read, and update operations.
- `flag-evaluation`: Requires valid admin authentication for `POST /flags/{key}/evaluate` in the first implementation.
- `audit-log`: Requires valid admin authentication for audit log reads.

## Impact

- Affected API/application code: Express routing or middleware, application startup configuration, API error mapping, and test wiring.
- Affected public API: protected endpoints gain required `X-Admin-API-Key` authentication and `401 Unauthorized` responses; `GET /health` remains unauthenticated.
- Affected docs: `docs/api/openapi.yaml`, README or runbook local configuration examples, and OpenSpec specs.
- Affected tests: missing key, invalid key, valid key, protected endpoint matrix, startup configuration, and unaffected operational endpoint regressions.
- No new runtime dependencies, persistence changes, gateway configuration, cloud secret storage, user identity model, or domain-layer dependency on authentication.
