## Context

FlagForge already has a Docker image, a local Compose stack for the API and PostgreSQL, a local development runbook, and host-only verification through `npm run verify`. Accepted ADRs establish a local-first platform path and Kong as the future self-hosted API gateway while keeping the Express API independent from infrastructure concerns.

This change adds the first Kong integration for local development only. Kong routes to the existing Compose `app` service over the Compose network, using DB-less declarative configuration stored outside `src/`. Direct app access remains available so existing workflows, tests, and API behavior do not change.

## Goals / Non-Goals

**Goals:**

- Run Kong locally with Docker Compose and declarative DB-less configuration.
- Route the same FlagForge HTTP API surface through the Kong proxy.
- Keep gateway configuration in an infrastructure-oriented path such as `infra/kong/`.
- Keep the API code independent from Kong-specific configuration or runtime assumptions.
- Document local startup, validation, and troubleshooting.
- Provide a Docker-only smoke check that proves Kong proxies through to the API.
- Keep `npm run verify` host-only and independent of Docker.

**Non-Goals:**

- Authentication, authorization, API key enforcement, or rate limiting in Kong.
- Admin API hardening beyond not exposing it on the host by default.
- Helm, kind, Argo CD, AWS, EKS, ALB, or production deployment.
- Replacing direct local app access with gateway-only access.
- Changing the FlagForge public API contract or application behavior.

## Decisions

1. Use Docker Compose for the first local Kong runtime.

   Docker Compose matches the current local platform layer and avoids introducing kind or Helm before their dedicated changes. The gateway service should join the existing Compose network and depend on the app being started for local smoke validation. Alternatives considered: a standalone `docker run` command, which is less reproducible, and kind/Helm, which is explicitly out of scope.

2. Configure Kong in DB-less declarative mode under `infra/kong/`.

   A checked-in declarative config makes route behavior reviewable, versioned, and reusable by future platform work. Keeping it under `infra/kong/` prevents application source from absorbing gateway concerns. Alternatives considered: configuring Kong through Admin API calls at startup, which requires a management surface and mutable setup flow, and embedding config near Express routes, which violates the gateway/app boundary.

3. Route the complete current API surface through one local service/route baseline.

   The first gateway increment should prove Kong reaches FlagForge without adding policy behavior. A broad route to the app keeps direct and gateway paths equivalent for current endpoints including operational, flag management, evaluation, and audit-log routes. Future changes can add route-specific plugins or policy after API key protection and rate limiting are specified.

4. Do not expose Kong Admin API on the host by default.

   DB-less configuration does not require host Admin API access for normal local startup. Avoiding a host port reduces accidental local exposure and keeps the issue focused on proxy routing. If a later debugging workflow needs Admin API access, it should be opt-in, local-only, and separately documented.

5. Add an explicit Docker-only gateway smoke target outside `npm run verify`.

   Gateway validation needs Docker and running services, so it should not be part of the host-only completion gate. A Makefile target such as `smoke-gateway` can issue a request through `http://localhost:${KONG_PROXY_PORT:-8000}/health` and fail if the proxied API response is unavailable.

## Risks / Trade-offs

- Kong route appears healthy but does not reach FlagForge -> The smoke check must assert a FlagForge endpoint through the Kong proxy, not only Kong process health.
- Gateway config becomes hard to reuse for future kind or Helm work -> Keep Kong declarative config in `infra/kong/` and keep Compose-only details in `docker-compose.yml`.
- Gateway entrypoint implies security guarantees that do not exist -> Documentation and config must state that authentication, authorization, rate limiting, and production hardening are out of scope.
- Admin API is accidentally exposed locally -> Compose must not publish Kong Admin API ports by default, and review must confirm only the proxy port is published.
- Troubleshooting becomes ambiguous across API, database, and gateway layers -> The runbook should include targeted checks for app health, Kong proxy routing, Compose service status, and logs.
