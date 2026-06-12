## Context

FlagForge exposes a small Express HTTP API for health checks, feature flag management, flag evaluation, and audit-log inspection. The runtime behavior is already defined across OpenSpec specs, Zod schemas, Express routes, and tests, but there is no single machine-readable API contract for contributors, reviewers, QA, or future gateway/client work.

This change adds an OpenAPI contract as source-controlled project documentation. It must mirror existing behavior and validation rules without changing route behavior, response payloads, persistence, evaluation semantics, or audit-log semantics.

## Goals / Non-Goals

**Goals:**

- Add a canonical OpenAPI document for the current public HTTP API.
- Document existing paths, parameters, request bodies, response bodies, status codes, and error payloads.
- Add a repeatable local and CI validation command for malformed OpenAPI syntax.
- Document how contributors validate and view the contract.
- Keep the implementation documentation-focused and low-risk.

**Non-Goals:**

- Do not add authentication, authorization, tenancy, API versioning, SDK generation, server generation, or gateway configuration.
- Do not expose a Swagger UI or OpenAPI route from the FlagForge runtime server.
- Do not change endpoint behavior, Zod validation behavior, response shapes, or status codes.
- Do not add contract-example verification against integration tests in this first contract change.

## Decisions

### Store the canonical contract at `docs/api/openapi.yaml`

The OpenAPI file will live under documentation rather than the repository root because it is a source-controlled contract artifact, not runtime source or generated build output. A dedicated `docs/api/` directory also gives future API documentation room to grow without mixing it into `src/` or OpenSpec change artifacts.

Alternatives considered:

- Repository root `openapi.yaml`: easy to find, but adds more root-level files and does not group API documentation.
- Generated output only: reduces manual maintenance but fails the requirement that the contract be source-controlled project documentation.
- Runtime `src/` location: implies application ownership and runtime coupling that this change intentionally avoids.

### Author the first contract manually from accepted behavior sources

The first contract will be handwritten from `openspec/specs/`, `src/api/app.ts`, `src/domain/schemas.ts`, domain types, and API tests. This keeps the scope small and avoids introducing a Zod-to-OpenAPI generation layer before the project needs one.

Alternatives considered:

- Generate from Zod schemas: attractive for drift prevention, but adds generator coupling and still requires manual route/status/error documentation.
- Generate from Express routes: not enough schema detail and higher complexity for the current API size.
- Hybrid generation: viable later, but premature for the first contract.

### Validate OpenAPI syntax with a dedicated npm script

Add `npm run openapi:validate` as the canonical local command for validating the OpenAPI document. Wire that script into `npm run verify` and the GitHub Actions workflow so malformed OpenAPI syntax fails local and CI gates.

The implementation should use a maintained OpenAPI CLI validator or linter installed as a dev dependency. The validation command must be host-only and must not require Docker, PostgreSQL, or a running FlagForge server.

Alternatives considered:

- Rely on external online validators: no dependency, but not repeatable in CI.
- Only validate during documentation preview: too easy to skip.
- Add semantic contract tests now: stronger drift protection, but beyond the first-change scope and explicitly deferred.

### Provide a local documentation preview command

Document a local preview workflow, preferably through an npm script such as `npm run openapi:preview`, using the same OpenAPI toolchain where practical. This keeps viewing the contract repeatable without adding a runtime documentation route or production deployment concern.

Alternatives considered:

- Runtime Swagger UI route: convenient, but introduces runtime behavior and dependency surface outside the PRD's non-goals.
- External viewer only: simple, but less repeatable for contributors.

### Treat audit event identifiers and timestamps as documented response fields

The audit-log API already returns `id` and `occurredAt` in public responses. The OpenAPI schema will document them as string fields, with `occurredAt` represented as a date-time string. The contract should not over-specify internal ID generation beyond the current public shape.

## Risks / Trade-offs

- Handwritten contract drift -> Mitigate by adding validation to local and CI gates and documenting that API behavior changes must update the OpenAPI file alongside OpenSpec specs and tests.
- Syntax validation does not prove behavioral parity -> Mitigate by keeping the first contract tightly aligned to existing OpenSpec specs, route code, and tests; defer semantic contract checks to a future change.
- New validator dependency can add install or lint noise -> Mitigate by choosing a maintained dev dependency and a minimal command that validates one YAML file.
- Preview tooling can expand scope -> Mitigate by keeping preview local-only and documented, with no runtime route or production viewer deployment.
