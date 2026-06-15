# Test Plan: add-admin-auth-api-keys

## Scope

This plan covers validation for the first FlagForge administrative authentication boundary: a single configured admin API key accepted only through the `X-Admin-API-Key` request header.

The focus is to prove that:

- runtime startup outside tests fails when `ADMIN_API_KEY` is missing;
- missing `ADMIN_API_KEY` startup failures report the admin auth configuration remediation rather than a PostgreSQL initialization failure;
- tests can construct the API with explicit admin authentication configuration;
- protected administrative endpoints reject missing, invalid, and query-parameter-only API keys with the same generic `401 Unauthorized` response;
- valid credentials preserve the existing flag management, evaluation, audit-log, validation, duplicate-key, and not-found behavior;
- authentication failures happen before protected operations, request validation, use case execution, audit writes, or data reads;
- `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics` remain public operational endpoints;
- OpenAPI documents only the header API key scheme, marks protected operations, leaves documented operational endpoints unauthenticated, and includes `401` responses only for protected operations;
- docs use non-secret local examples and do not introduce committed real secrets.

Out of scope: user accounts, RBAC, OAuth/OIDC, API key rotation, multiple active keys, tenant-scoped keys, SDK/client credentials, Kong, rate limiting, Kubernetes, cloud secret storage, persistence schema changes, or domain-layer authentication behavior.

## Test levels

### Unit tests

- Add focused configuration tests for parsing `ADMIN_API_KEY`: configured value succeeds, missing runtime value fails clearly, and test construction can provide an explicit key without global environment mutation.
- Add focused startup error formatting tests for `AdminAuthConfigError`, existing database startup errors, and unexpected runtime startup errors.
- Add focused API-boundary auth tests for header extraction and comparison if the implementation introduces a standalone guard/helper.
- Verify the authentication failure response builder, if separated, returns one generic status/code/message for missing and invalid credentials.
- Verify auth code does not import or depend on domain repositories, evaluator logic, PostgreSQL adapters, or audit event construction.

### API tests

- Update existing protected-route success tests in `test/app.test.ts` to send a valid `X-Admin-API-Key`.
- Cover missing and invalid `X-Admin-API-Key` for each protected endpoint:
  - `POST /flags`
  - `GET /flags`
  - `GET /flags/{key}`
  - `PATCH /flags/{key}`
  - `POST /flags/{key}/evaluate`
  - `GET /audit-log`
- Cover query-parameter-only credentials, such as `?apiKey=...` or equivalent, and assert they are treated as unauthenticated.
- Assert missing and invalid credentials return identical generic `401` bodies.
- Assert `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics` remain accessible without credentials.
- Assert unknown routes keep their existing `404` behavior unless the implementation intentionally scopes auth before route matching for a documented protected route.

### Integration tests

- Run the standard API suite against the app dependencies used in existing tests to prove valid credentials preserve existing behavior.
- If PostgreSQL-backed API integration tests are present for this change, include valid admin credentials in their requests and verify no persistence behavior changes.
- Validate startup wiring from `src/server.ts` with `ADMIN_API_KEY` configured and missing, without requiring a real secret in the repository.
- Validate that missing `ADMIN_API_KEY` startup diagnostics mention the admin auth configuration requirement and do not mention PostgreSQL persistence initialization.

### Contract tests

- Validate `docs/api/openapi.yaml` defines an API key security scheme using header name `X-Admin-API-Key`.
- Validate protected operations declare the admin security requirement.
- Validate protected operations document `401` responses using the standard error response schema.
- Validate `GET /health`, `GET /healthz`, and `GET /readyz` do not declare the admin security requirement.
- Validate the OpenAPI contract does not document query parameter API keys.

### Manual checks

- Start the API locally with a non-secret development key and confirm a protected endpoint succeeds only when the header is present.
- Start the API locally without `ADMIN_API_KEY` and confirm startup fails before listening.
- Review README, `.env.example`, or runbook updates to confirm examples are clearly non-secret and no real key values were committed.

## Cases

### Happy paths

- `GET /health` without `X-Admin-API-Key` returns `200` and `{ "status": "ok" }`.
- `GET /healthz` without `X-Admin-API-Key` returns `200` and `{ "status": "ok" }`.
- `GET /readyz` without `X-Admin-API-Key` returns the readiness result for the current dependency state rather than `401`.
- `GET /metrics` without `X-Admin-API-Key` returns Prometheus-compatible metrics text.
- `POST /flags` with a valid key creates a flag and records the existing audit event.
- `GET /flags` with a valid key returns the existing list response.
- `GET /flags/{key}` with a valid key returns an existing flag and still returns `404` for a missing flag.
- `PATCH /flags/{key}` with a valid key updates a flag and records the existing audit event.
- `POST /flags/{key}/evaluate` with a valid key preserves existing evaluation success, validation, and not-found behavior.
- `GET /audit-log` with a valid key preserves empty-list, populated-list, ordering, and `flagKey` filter behavior.
- Runtime startup succeeds when `ADMIN_API_KEY` is configured.

### Edge cases

- Missing `X-Admin-API-Key` and invalid `X-Admin-API-Key` return the same `401` status, `error.code`, and `error.message`.
- Query-string credentials without the header return the same generic `401` response as a missing header.
- A wrong header plus a correct query parameter still returns `401`.
- A valid header plus irrelevant query parameters succeeds.
- Authentication runs before request body validation: unauthenticated invalid create/update/evaluation payloads return `401`, not `400`.
- Authentication runs before route parameter validation for protected flag routes: unauthenticated invalid flag keys return `401`, not `400`.
- Authentication failures do not include the configured key, submitted key, comparison details, database details, stack traces, or missing-versus-invalid distinctions.
- Missing `ADMIN_API_KEY` startup formatting preserves the `ADMIN_API_KEY is required for admin API authentication` message.
- Database startup formatting still preserves database configuration and PostgreSQL dependency messages.
- Unexpected startup errors use a neutral runtime startup message rather than a PostgreSQL-specific message.
- Authentication failure for `POST /flags` does not create a flag or audit event.
- Authentication failure for `PATCH /flags/{key}` does not update a flag or append an audit event.
- Authentication failure for `POST /flags/{key}/evaluate` does not evaluate the flag or leak not-found/validation information.
- Authentication failure for `GET /audit-log` does not return audit events or filter validation details.
- Existing JSON parse errors on protected endpoints should be checked against the final middleware order; the expected behavior should be documented by the implementation tests.

### Failure cases

- Runtime startup without `ADMIN_API_KEY` outside tests fails before the API accepts requests.
- Runtime startup without `ADMIN_API_KEY` outside tests does not log `PostgreSQL persistence failed to initialize`.
- Protected route without credentials returns `401` and no protected operation occurs.
- Protected route with invalid credentials returns `401` and no protected operation occurs.
- Protected route with only query parameter credentials returns `401` and no protected operation occurs.
- OpenAPI validation fails if any protected operation lacks the security requirement or `401` response.
- OpenAPI validation fails if a query parameter API key is documented as supported.

## Data

### Environment values

- Runtime variable: `ADMIN_API_KEY`.
- Header name: `X-Admin-API-Key`.
- Non-secret test/development value: `dev-admin-api-key`.
- Invalid submitted value: `wrong-admin-api-key`.
- Sensitive sentinel values for leak tests: configured key `super-secret-admin-key` and submitted key `submitted-secret-admin-key`.

### Fixtures

- Reuse existing flag fixtures from `test/app.test.ts`, including `checkout-redesign` and rollout examples.
- Reuse deterministic audit metadata helpers for audit event assertions.
- Use a fresh in-memory app per API test unless a test intentionally needs persistent setup within the same case.
- Use explicit app dependencies or explicit auth config in tests instead of relying on ambient production environment variables.

## Automation

### Focused commands

- `npm test -- --run test/app.test.ts`
- `npm test -- --run test/postgres-config.test.ts` or a new focused auth configuration test file if added
- `npm test -- --run test/admin-auth.test.ts` or the focused file containing runtime startup error formatter coverage
- `npm run openapi:validate`
- `openspec validate add-admin-auth-api-keys --strict`

### Expected gates

- TypeScript: `npm run typecheck` passes.
- Lint: `npm run lint` passes.
- Formatting: `npm run format:check` passes.
- Tests: `npm test` passes.
- OpenAPI: `npm run openapi:validate` passes.
- OpenSpec: `openspec validate add-admin-auth-api-keys --strict` and `openspec validate --all --strict` pass.
- Completion gate: `npm run verify` passes.

## Residual risk

- A single shared admin key is intentionally coarse-grained and does not prove user identity, role authorization, tenant isolation, key rotation, or client SDK credential behavior.
- Header-based API tests prove application enforcement but do not validate future gateway, proxy, or ingress behavior.
- Simple string comparison may not cover higher-threat timing analysis; the change explicitly defers stronger secret-management controls to future security work.
- Manual local startup checks depend on the developer environment and do not replace CI or deployment validation.

## Blockers

None.

## Suggestions

- Add a small shared Supertest helper for authenticated admin requests so existing API tests remain readable after adding the header.
- Add one table-driven protected-endpoint matrix test for missing and invalid credentials to reduce duplication while keeping per-endpoint coverage explicit.
- Add a focused leak assertion that checks the serialized response body for both configured and submitted sentinel keys.
- Keep auth configuration tests in a dedicated file if startup parsing grows beyond the existing PostgreSQL configuration test pattern.

## Recommendation

Proceed with plan.
