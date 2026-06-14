## Context

FlagForge currently exposes health, flag management, evaluation, and audit-log endpoints through a single Express app. Request parsing, route wiring, validation, and error mapping live in `src/api/`, startup wiring lives in `src/server.ts`, and domain/application behavior remains independent from HTTP transport concerns.

Issue #18 and the PRD require a first administrative authentication boundary before later Kong, rate-limiting, or identity-aware platform work. The first implementation protects the global administrative API surface with one configured API key and intentionally avoids user identity, RBAC, OAuth/OIDC, key rotation, multi-tenancy, gateway integration, or cloud secret storage.

## Goals / Non-Goals

**Goals:**

- Enforce `X-Admin-API-Key` authentication for `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- Keep `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics` unauthenticated.
- Load the configured admin key from `ADMIN_API_KEY`.
- Fail startup outside tests when `ADMIN_API_KEY` is missing.
- Return the same generic HTTP `401 Unauthorized` response for missing and invalid keys without exposing sensitive details.
- Keep authentication enforcement near the API/application boundary.
- Update OpenAPI, README or runbook documentation, and tests.

**Non-Goals:**

- User accounts, RBAC, OAuth/OIDC, API key rotation, multiple active keys, per-tenant ownership, or SDK/client credentials.
- Kong, Kubernetes, AWS Secrets Manager, cloud secret storage, or rate limiting.
- Persistence schema changes.
- Domain-layer awareness of HTTP headers, secrets, or authentication state.

## Decisions

### Use `X-Admin-API-Key` header only

The API will accept the configured key only from the `X-Admin-API-Key` request header. Query parameter keys will not be supported or documented.

Rationale: headers avoid accidental logging and sharing patterns that are common with URLs, and the PRD explicitly resolves this mechanism.

Alternative considered: query parameter API keys. Rejected because they are easier to leak through logs, browser history, monitoring tools, and shared URLs.

### Add a small API-boundary authentication module or middleware

Authentication parsing and enforcement should live under `src/api/`, either as a focused middleware/helper or route-level guard. Protected routes should run the guard before request body validation and use case invocation.

Rationale: this preserves the existing architecture where HTTP concerns stay in the API layer and domain/application services remain focused on feature flag behavior.

Alternative considered: adding API key checks to use cases. Rejected because it would couple domain/application behavior to transport and secret handling.

### Pass explicit admin authentication configuration into app creation

`createApp` should receive admin auth configuration through dependencies, and `src/server.ts` should parse `ADMIN_API_KEY` at startup before constructing the app. Test-only app construction can use explicit values or a test-safe default without requiring global environment mutation for every focused test.

Rationale: explicit configuration keeps tests deterministic and avoids hidden process-level dependencies inside route handlers.

Alternative considered: reading `process.env.ADMIN_API_KEY` directly inside middleware. Rejected because it makes route behavior harder to test and obscures startup failure behavior.

### Fail startup outside tests when `ADMIN_API_KEY` is missing

Runtime startup should reject missing `ADMIN_API_KEY` outside tests. Test code may bypass startup validation by providing explicit app dependencies or running under the test environment.

Rationale: production-like runtime should never start with unprotected administrative endpoints, while unit and integration tests still need focused setup control.

Alternative considered: a committed default key for all environments. Rejected because local defaults can accidentally become treated as real secrets and weaken the security boundary.

### Use a generic `401 Unauthorized` error payload

Missing and invalid keys should both return the same status, code, and message. The response must not reveal whether the key was missing or wrong and must not include configured key values or comparison details.

Rationale: generic authentication failures reduce information disclosure and keep error behavior predictable.

Alternative considered: separate `missing_api_key` and `invalid_api_key` errors. Rejected because they reveal unnecessary details to unauthenticated callers.

### Document protected operations in OpenAPI

The OpenAPI contract should define an API key security scheme for `X-Admin-API-Key`, apply it to protected operations, leave `GET /health` unauthenticated, and add `401` responses using the standard error response shape.

Rationale: authentication changes are public API behavior and must stay aligned across OpenSpec, OpenAPI, and tests.

Alternative considered: documenting auth only in README. Rejected because clients and reviewers rely on the source-controlled OpenAPI contract for operation-level requirements.

## Risks / Trade-offs

- Existing local scripts and tests that call protected endpoints without headers will fail. Mitigation: update tests and README examples with a clearly non-secret development value.
- Protecting `POST /flags/{key}/evaluate` is stricter than a future client SDK model. Mitigation: keep this first boundary explicit and revisit separate client/evaluation credentials in a future OpenSpec change.
- Startup failure can make local development less convenient. Mitigation: document `.env` configuration and provide non-secret example values in `.env.example` or README.
- String comparison can leak timing information in high-threat scenarios. Mitigation: use a simple, well-contained comparison appropriate for the current local platform level, and avoid logging secret values; stronger secret management can be introduced by a future security change.
- Applying middleware too broadly could protect operational endpoints accidentally. Mitigation: attach auth only to the specified admin routes and add regression coverage for `GET /health`, `GET /healthz`, `GET /readyz`, and `GET /metrics`.

## Migration Plan

1. Add explicit admin auth configuration parsing and startup validation.
2. Add the API-boundary authentication guard and apply it to the protected endpoint list without wrapping operational health, readiness, or metrics routes.
3. Update API tests to include valid credentials for existing protected-route success cases and add missing/invalid credential coverage.
4. Update OpenAPI and README or runbook documentation.
5. Run focused tests, OpenAPI validation, OpenSpec validation, and `npm run verify`.

Rollback is a code revert of the authentication guard, startup configuration, docs, OpenAPI, and tests. No database migration or data rollback is required.

## Open Questions

None.
