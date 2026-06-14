## 1. Configuration

- [ ] 1.1 Add admin API key configuration parsing from `ADMIN_API_KEY` with startup failure outside tests when it is missing.
- [ ] 1.2 Wire parsed admin auth configuration into `createApp` from `src/server.ts`.
- [ ] 1.3 Add focused tests for configured startup behavior, missing runtime configuration, and explicit test configuration.

## 2. API Authentication

- [ ] 2.1 Add an API-boundary authentication guard for the `X-Admin-API-Key` header.
- [ ] 2.2 Return the same generic HTTP `401 Unauthorized` error response for missing and invalid admin API keys.
- [ ] 2.3 Ensure query parameter API keys are not accepted as a supported authentication mechanism.
- [ ] 2.4 Apply the guard only to `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- [ ] 2.5 Keep `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics` unauthenticated.

## 3. Tests

- [ ] 3.1 Update existing protected endpoint success tests to send a valid `X-Admin-API-Key`.
- [ ] 3.2 Add missing-key and invalid-key tests for protected flag management endpoints.
- [ ] 3.3 Add missing-key and invalid-key tests for protected flag evaluation.
- [ ] 3.4 Add missing-key and invalid-key tests for protected audit log access.
- [ ] 3.5 Add regression coverage that authentication failures do not perform the protected operation.
- [ ] 3.6 Add regression coverage that authentication failures do not expose configured keys, submitted keys, comparison details, database details, or stack traces.
- [ ] 3.7 Add regression coverage that operational endpoints remain accessible without an admin API key, including `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics`.

## 4. Documentation and API Contract

- [ ] 4.1 Update `docs/api/openapi.yaml` with the `X-Admin-API-Key` security scheme.
- [ ] 4.2 Mark protected operations as requiring admin API key authentication in OpenAPI while leaving `GET /health`, `GET /healthz`, and `GET /readyz` unauthenticated.
- [ ] 4.3 Document HTTP `401 Unauthorized` responses for protected operations in OpenAPI without adding `401` responses to unauthenticated operational endpoints.
- [ ] 4.4 Ensure OpenAPI does not document query parameter API keys.
- [ ] 4.5 Update README or runbook documentation with local `ADMIN_API_KEY` configuration and request examples using a clearly non-secret development value.
- [ ] 4.6 Update `.env.example` or equivalent local configuration docs without committing real secrets.

## 5. Verification

- [ ] 5.1 Run focused Vitest coverage for API authentication and configuration behavior.
- [ ] 5.2 Run `npm run openapi:validate`.
- [ ] 5.3 Run `openspec validate --all --strict`.
- [ ] 5.4 Run `npm run verify`.
