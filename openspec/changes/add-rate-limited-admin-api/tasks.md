## 1. Configuration and Middleware

- [ ] 1.1 Add admin rate-limit configuration parsing with a documented default of 60 requests per minute and startup validation for overrides.
- [ ] 1.2 Implement in-process fixed-window admin rate-limit accounting with injectable time for deterministic tests.
- [ ] 1.3 Add an Express middleware that returns HTTP 429 with a generic `rate_limited` error and `Retry-After` when the authenticated identity exceeds the limit.
- [ ] 1.4 Wire rate limiting after admin authentication and before protected endpoint parsing, validation, and use-case execution.

## 2. API Contract and Documentation

- [ ] 2.1 Update the standard API error code typing to include `rate_limited`.
- [ ] 2.2 Update `docs/api/openapi.yaml` so protected administrative operations document HTTP 429 responses and `Retry-After` where applicable.
- [ ] 2.3 Document local admin rate-limit configuration, allowed request validation, limited response validation, and reset/recovery validation.
- [ ] 2.4 Document that gateway-dependent validation remains a separate smoke check outside `npm run verify` when it requires Docker, Kong, or running services.

## 3. Tests

- [ ] 3.1 Add focused unit tests for rate-limit configuration parsing and invalid override diagnostics.
- [ ] 3.2 Add focused unit tests for fixed-window allow, deny, and reset/recovery behavior without real-time sleeps.
- [ ] 3.3 Add API tests proving protected admin requests below the limit continue to use current endpoint behavior.
- [ ] 3.4 Add API tests proving over-limit protected admin requests return HTTP 429, do not perform the administrative operation, and do not leak secret or implementation details.
- [ ] 3.5 Add API tests proving missing or invalid admin credentials return HTTP 401 before rate limiting and do not consume authenticated rate-limit budget.
- [ ] 3.6 Add API tests proving `/health`, `/healthz`, `/readyz`, and `/metrics` do not require or consume admin rate-limit budget.

## 4. Validation

- [ ] 4.1 Run focused tests for admin authentication, rate limiting, and app routing.
- [ ] 4.2 Run `npm run openapi:validate`.
- [ ] 4.3 Run `npm run openspec:validate`.
- [ ] 4.4 Run `npm run verify` before marking implementation complete.
