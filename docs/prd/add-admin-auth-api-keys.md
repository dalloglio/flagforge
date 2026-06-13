# PRD: add-admin-auth-api-keys

## Problem

FlagForge exposes administrative API capabilities, but admin operations are not
yet protected by an application-level authentication mechanism. Before adding
gateway-level controls, rate limiting, or identity-aware platform behavior, the
API needs a simple and explicit admin authentication boundary.

Without that boundary, mutation and administrative read operations remain
available to any caller that can reach the service. FlagForge is not currently
multi-tenant and does not model user ownership of flags, but flag configuration,
evaluation behavior, and audit history are still administrative data. Leaving
them public is not a good foundation for the Level 1 local platform path or
later Kong work.

## Goals

- Add API key authentication for administrative endpoints.
- Make protected and unprotected API behavior explicit through OpenSpec and
  OpenAPI updates.
- Keep valid local development workflows possible with non-secret defaults or
  documented environment configuration.
- Ensure missing and invalid credentials fail without leaking sensitive details.
- Preserve existing non-admin behavior unless the OpenSpec change explicitly
  changes it.
- Keep authentication parsing and enforcement near API/application boundaries,
  with domain logic independent from HTTP, secrets, Kong, Kubernetes, and cloud
  infrastructure.

## Non-goals

- User accounts.
- RBAC.
- OAuth or OIDC.
- Kong configuration.
- Rate limiting.
- Key rotation workflow.
- Multi-tenancy.
- AWS Secrets Manager or cloud secret storage.
- Production-grade identity management.

## Users

- Developers running FlagForge locally with protected admin operations.
- Contributors adding or changing administrative API behavior.
- QA reviewers validating authentication success, failure, and regression
  scenarios.
- Security/LGPD reviewers checking secret handling and error behavior.
- Future gateway and platform work that needs a clear upstream authentication
  boundary before adding Kong policies.

## Requirements

- OpenSpec artifacts must define admin API key authentication behavior before
  implementation.
- The PRD and OpenSpec proposal must identify which endpoints are admin
  endpoints and therefore require API key authentication.
- Protected admin endpoints must reject requests that do not include a valid API
  key.
- Protected admin endpoints must reject requests with invalid credentials.
- The protected endpoint set for the first implementation must include
  `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`,
  `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- Operational endpoints, including `/health`, future liveness/readiness
  endpoints, and metrics endpoints, must remain accessible without the admin API
  key.
- The API key must be provided with the `X-Admin-API-Key` request header.
- API keys supplied through query parameters must be rejected or ignored and must
  not be documented as a supported authentication mechanism.
- The first implementation must support one configured API key.
- The configured key must come from `ADMIN_API_KEY`.
- The application must fail startup outside tests when `ADMIN_API_KEY` is not
  configured.
- Valid credentials must allow the intended admin operation.
- Missing and invalid API keys must return HTTP `401 Unauthorized`.
- Authentication failures must use a generic error code and message that do not
  reveal whether the API key was missing or invalid.
- Authentication failures must not reveal configured API keys, secret comparison
  details, database details, stack traces, or other sensitive information.
- Existing non-admin behavior must remain unchanged unless explicitly specified
  by OpenSpec.
- API key configuration must use environment variables.
- Local development configuration must avoid committing real secrets.
- Tests must cover missing API key, invalid API key, valid API key, and
  unaffected non-admin behavior.
- OpenAPI documentation must describe authentication requirements for protected
  operations if the public contract changes.
- README or runbook documentation must explain local configuration and request
  examples using a clearly non-secret development value.
- The implementation must preserve architecture boundaries: domain behavior must
  not depend on API keys, HTTP headers, Express middleware, Kong, Kubernetes, or
  cloud secret storage.

## Risks

- The phrase "admin endpoints" is ambiguous unless the protected endpoint list is
  explicit before implementation.
- Protecting read endpoints can break existing local scripts or tests if the
  migration path is not documented.
- Leaving sensitive error details in responses or logs can undermine the security
  value of the change.
- A local default can become a real secret by accident if documentation is not
  clear.
- API key authentication can be overbuilt into a user identity system if non-goals
  are not enforced.
- Protecting `POST /flags/{key}/evaluate` is stricter than a future client SDK
  model, but it avoids creating an unauthenticated runtime surface before the
  project defines separate client or evaluation credentials.

## Resolved decisions

- FlagForge is not multi-tenant today; this change protects global
  administrative flag data rather than per-user or per-tenant data.
- `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`,
  `POST /flags/{key}/evaluate`, and `GET /audit-log` require admin API key
  authentication.
- Operational endpoints such as health, liveness, readiness, and metrics remain
  unauthenticated.
- The admin API key is supplied with `X-Admin-API-Key`.
- Query parameter API keys are not supported.
- The first implementation supports one configured key through `ADMIN_API_KEY`.
- Missing and invalid keys both return HTTP `401 Unauthorized` with a generic
  error response.
- The application fails startup outside tests when `ADMIN_API_KEY` is not
  configured.

## Open questions

None.

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/18
- OpenSpec change id requested by issue: `add-admin-auth-api-keys`
- Relevant docs: `docs/adr/0011-use-kong-as-self-hosted-api-gateway.md`,
  `docs/adr/0015-use-security-scanning-in-staged-adoption.md`,
  `docs/adr/0016-use-hexagonal-architecture-and-ddd-lite.md`,
  `docs/adr/0018-use-role-based-review-gates.md`,
  `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`
