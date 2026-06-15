# PRD: add-rate-limited-admin-api

## Problem

FlagForge now has an administrative API authentication boundary and a local Kong
gateway direction. The next product risk is uncontrolled request volume against
administrative operations. A caller with valid admin credentials can repeatedly
create, list, update, evaluate, or inspect administrative resources without a
documented limit or recovery behavior.

Without rate limiting, the local platform path lacks a concrete gateway and
application-boundary exercise for traffic control. Contributors also lack a
stable contract for what clients see when administrative request volume exceeds
the supported local limit.

## Goals

- Add documented rate-limit behavior for protected administrative API requests.
- Preserve successful behavior for valid administrative requests below the
  configured limit.
- Return a predictable, documented response when an administrative caller exceeds
  the configured limit.
- Associate rate-limit accounting with the authenticated administrative identity
  or gateway key used for the request.
- Keep unauthenticated operational endpoints usable for health, readiness, and
  metrics checks.
- Keep the Express application independent from Kong-specific configuration,
  packages, and runtime assumptions.
- Provide deterministic local validation for allowed, limited, and
  reset/recovery scenarios.

## Non-goals

- User accounts.
- RBAC.
- Billing, plan quotas, or commercial entitlements.
- Distributed production rate-limit storage.
- AWS WAF, AWS API Gateway, ALB policy, or cloud edge controls.
- Alerting rules or production SLOs.
- Changing feature flag evaluation semantics.
- Changing PostgreSQL persistence behavior for flags or audit events.
- Replacing admin API key authentication.

## Users

- Developers using protected admin API operations locally.
- Contributors practicing gateway and application boundary decisions.
- QA reviewers validating allowed, denied, and recovery behavior.
- Security/LGPD reviewers checking error disclosure and credential handling.
- SRE reviewers assessing operational impact and local validation clarity.
- Future platform work that needs an explicit rate-limit baseline before
  Kubernetes or cloud delivery.

## Requirements

- OpenSpec artifacts must define admin API rate-limit behavior before
  implementation.
- The OpenSpec proposal or design must explicitly choose the enforcement
  boundary for the first implementation: gateway-level, application-level, or a
  split by concern.
- The chosen boundary must preserve the accepted architecture rule that
  application source does not import Kong packages, read Kong-specific
  configuration, or branch on Kong runtime behavior.
- Rate limiting must apply to protected administrative endpoints:
  `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`,
  `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- Operational endpoints, including `/health`, `/healthz`, `/readyz`, and
  `/metrics`, must remain outside the admin rate limit.
- The first local rate limit must be explicitly documented as a configurable
  limit with a non-secret local default.
- The initial product target for local development must allow 60 protected admin
  requests per minute per authenticated admin identity.
- Rate-limit accounting must be tied to the authenticated admin API key or the
  gateway identity that represents it.
- Requests with missing or invalid admin credentials must continue to return the
  documented authentication failure instead of a rate-limit response.
- Valid protected admin requests below the limit must continue to return their
  current successful or domain-specific error responses.
- Protected admin requests above the limit must return HTTP `429`.
- Rate-limit responses must use a documented error code and generic message that
  do not expose configured secrets, internal key values, storage details, stack
  traces, or gateway implementation details.
- Rate-limit responses should include standard recovery guidance, such as a
  `Retry-After` response header, when the implementation can compute it
  deterministically.
- The reset/recovery behavior must be deterministic enough for automated tests
  or gateway smoke checks.
- Local documentation must explain how to configure the limit, exercise an
  allowed request, trigger a limited response, and verify recovery after reset.
- Tests or smoke checks must cover allow, deny, and reset/recovery behavior.
- Gateway smoke checks must remain outside `npm run verify` if they require
  Docker, Kong, or running services.
- Host-only validation must still cover any application-level behavior introduced
  by this change.
- OpenAPI documentation must describe rate-limit responses for protected
  administrative operations if the public API contract changes.
- Existing feature flag evaluation rules, audit event construction, and
  PostgreSQL persistence behavior must remain unchanged except for documented
  rate-limit responses.

## Risks

- Gateway-only enforcement can leave direct local API access as a bypass unless
  the bypass is either closed or explicitly documented as a development-only
  path.
- Application-only enforcement may underuse the Kong learning objective unless
  the design explains what remains gateway-owned now or later.
- Per-process in-memory counters are acceptable for local learning but can be
  mistaken for production-grade distributed rate limiting if documentation is not
  explicit.
- Time-based tests can become flaky unless the reset window is controllable or
  deterministic in test and smoke-check flows.
- Rate-limit responses can leak implementation details if they expose internal
  policy names, credential identifiers, stack traces, or gateway errors.
- Applying limits before authentication can make missing or invalid credentials
  produce confusing responses and weaken the existing authentication contract.

## Resolved decisions

- The first local product target is 60 protected admin requests per minute per
  authenticated admin identity.
- Missing or invalid admin credentials continue to fail with the existing
  authentication response and do not become rate-limit responses.
- Protected admin requests above the configured limit return HTTP `429`.
- Operational endpoints remain outside the admin rate limit.
- The rate limit is local-development focused and is not a distributed
  production quota system.
- The OpenSpec design must decide the enforcement boundary before implementation
  and must call out any direct API bypass or split responsibility.
- Gateway-dependent smoke validation remains outside `npm run verify`.

## Open questions

None.

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/20
- OpenSpec change id requested by issue: `add-rate-limited-admin-api`
- Relevant docs: `docs/adr/0011-use-kong-as-self-hosted-api-gateway.md`,
  `docs/adr/0015-use-security-scanning-in-staged-adoption.md`,
  `docs/adr/0016-use-hexagonal-architecture-and-ddd-lite.md`,
  `docs/adr/0018-use-role-based-review-gates.md`,
  `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`
