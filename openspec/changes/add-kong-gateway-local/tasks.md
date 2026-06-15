## 1. Kong Configuration

- [x] 1.1 Create `infra/kong/` and add DB-less declarative Kong configuration that routes the current FlagForge API surface to the Compose `app` service.
- [x] 1.2 Configure the Kong service in `docker-compose.yml` to run in DB-less mode using the checked-in declarative configuration.
- [x] 1.3 Publish the Kong proxy on `${KONG_PROXY_PORT:-8000}` and do not publish Kong Admin API ports by default.
- [x] 1.4 Add `KONG_PROXY_PORT` to local environment documentation defaults such as `.env.example` if present.

## 2. Local Workflow Documentation

- [x] 2.1 Update `docs/runbooks/local-development.md` with local Kong startup, direct app access, gateway access, and troubleshooting guidance.
- [x] 2.2 Update `README.md` or the existing local workflow summary with the gateway command path and proxy port override.
- [x] 2.3 Document that Kong does not add authentication, authorization, rate limiting, production hardening, Helm, kind, Argo CD, or cloud deployment in this increment.

## 3. Gateway Smoke Validation

- [x] 3.1 Add a thin Makefile target such as `smoke-gateway` that sends a request through `http://localhost:${KONG_PROXY_PORT:-8000}/health`.
- [x] 3.2 Ensure gateway smoke validation fails when the proxied FlagForge endpoint is unavailable.
- [x] 3.3 Keep gateway smoke validation outside `npm run verify`.

## 4. Boundary and Regression Checks

- [x] 4.1 Confirm `src/` has no Kong imports, Kong-specific runtime configuration, or gateway-dependent branches.
- [x] 4.2 Confirm direct app health smoke validation still works through the existing app host port.
- [x] 4.3 Run `npm run verify`.
- [x] 4.4 Run the Docker-only gateway smoke flow when Docker is available and document any environment limitation if it cannot be run.
- [x] 4.5 Run `openspec validate --all --strict`.
