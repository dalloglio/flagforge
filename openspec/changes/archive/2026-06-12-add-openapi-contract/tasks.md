## 1. OpenAPI Tooling

- [x] 1.1 Choose and add a maintained OpenAPI validation/preview dev dependency.
- [x] 1.2 Add `openapi:validate` and `openapi:preview` npm scripts for `docs/api/openapi.yaml`.
- [x] 1.3 Update `npm run verify` so it runs OpenAPI validation without requiring Docker, PostgreSQL, or a running app.

## 2. Contract Authoring

- [x] 2.1 Create `docs/api/openapi.yaml` as the canonical source-controlled OpenAPI document.
- [x] 2.2 Document `GET /health`, `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- [x] 2.3 Document path and query parameters, including feature flag key validation and the `flagKey` audit-log filter.
- [x] 2.4 Document create, update, and evaluation request schemas from the current Zod validation behavior.
- [x] 2.5 Document feature flag, rule, rollout, evaluation result, audit event, context value, and error response schemas.
- [x] 2.6 Document current successful and client error responses, including 200, 201, 400 validation and malformed JSON responses, 404 not-found responses, and 409 duplicate-key conflicts.

## 3. Contributor Documentation

- [x] 3.1 Add repository documentation that explains how to validate the OpenAPI contract locally.
- [x] 3.2 Add repository documentation that explains how to preview or view the OpenAPI contract locally.
- [x] 3.3 Document that API behavior changes must keep OpenSpec specs, tests, and the OpenAPI contract aligned.

## 4. CI Integration

- [x] 4.1 Update the GitHub Actions workflow to run the canonical OpenAPI validation command.
- [x] 4.2 Keep CI steps named clearly so OpenAPI validation failures are easy to identify.

## 5. Verification

- [x] 5.1 Run `npm run openapi:validate`.
- [x] 5.2 Run `npm run verify`.
- [x] 5.3 Run `openspec validate --all --strict` and confirm the change artifacts validate.
