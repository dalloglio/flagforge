## Why

FlagForge needs a reproducible local gateway path before moving gateway delivery into kind, Helm, GitOps, or cloud infrastructure. Adding Kong locally now creates a concrete routing baseline without coupling the Express API to gateway-specific assumptions.

## What Changes

- Add source-controlled local Kong Gateway configuration for routing traffic to the FlagForge API.
- Add Docker Compose support for running Kong locally with DB-less declarative configuration.
- Document startup, validation, and troubleshooting for running the API through Kong.
- Add a Docker-only gateway smoke check that proves requests reach FlagForge through the Kong proxy.
- Keep direct app access and API behavior unchanged.
- Keep Kong Admin API unavailable on the host by default.
- Exclude authentication, authorization, rate limiting, Helm, kind, Argo CD, AWS, and production gateway hardening from this increment.

## Capabilities

### New Capabilities

- `local-kong-gateway`: Local Kong Gateway routing, configuration, documentation, and Docker-only smoke validation for the FlagForge API.

### Modified Capabilities

- None.

## Impact

- Adds infrastructure-oriented gateway configuration, expected under `infra/kong/`.
- Adds local Docker Compose wiring for Kong and gateway validation.
- Adds developer documentation or runbook guidance for local gateway startup and troubleshooting.
- Adds a Makefile or script entrypoint for a Docker-only gateway smoke check outside `npm run verify`.
- Does not change `src/` API behavior, public OpenAPI semantics, persistence, or the host-only verification gate.
