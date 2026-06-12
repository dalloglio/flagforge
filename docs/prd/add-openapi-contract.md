# PRD: add-openapi-contract

## Problem

FlagForge has a growing HTTP API, but its public contract is currently inferred from Express routes, tests, and OpenSpec specs. That makes documentation, review, QA, and future gateway or client integration harder than necessary because contributors do not have a single machine-readable API contract to inspect or validate.

This work creates an OpenAPI contract for the existing API surface requested in GitHub issue #13 without changing runtime behavior.

## Goals

- Provide a machine-readable OpenAPI contract for the current FlagForge HTTP API.
- Make request bodies, response bodies, status codes, error payloads, path parameters, and query parameters explicit enough for review and QA.
- Add a repeatable local and CI validation check that detects malformed OpenAPI syntax.
- Document how contributors can view and validate the contract.
- Preserve the existing API behavior while improving contract visibility.

## Non-goals

- Authentication or authorization requirements.
- Kong, gateway routing, or gateway policy configuration.
- SDK, client, or server code generation.
- API versioning strategy beyond the initial contract.
- Changes to endpoint behavior, response shapes, validation rules, status codes, persistence behavior, or evaluation semantics unless a separate OpenSpec change explicitly requires them.
- Production deployment documentation for the OpenAPI viewer.

## Users

- Developers building or changing FlagForge endpoints.
- Contributors preparing pull requests that affect API behavior.
- QA and role-based reviewers validating request, response, and error contracts.
- Future gateway, client integration, and platform work that needs a stable API contract input.
- Portfolio reviewers inspecting the project for API design and delivery discipline.

## Requirements

- The repository must include an OpenAPI contract for the current public HTTP API surface.
- The contract must cover `GET /health`, `POST /flags`, `GET /flags`, `GET /flags/{key}`, `PATCH /flags/{key}`, `POST /flags/{key}/evaluate`, and `GET /audit-log`.
- The contract must document path parameters, including feature flag key validation expectations for `{key}`.
- The contract must document the `GET /audit-log` `flagKey` query parameter and its validation failure behavior.
- The contract must document request schemas for creating flags, updating flags, and evaluating flags.
- The contract must document feature flag, rule, rollout, evaluation result, audit event, and error response schemas.
- The contract must represent supported rule operators `equals` and `in`.
- The contract must represent context values as strings, numbers, or booleans.
- The contract must document known successful status codes, including `200` and `201`.
- The contract must document known client error status codes, including validation, duplicate-key conflict, not-found, and malformed JSON cases.
- The contract must document the standard error response shape with `error.code`, `error.message`, and optional `error.details`.
- The contract must match the accepted OpenSpec behavior for flags, flag evaluation, audit log, persistence-visible API behavior, and CI quality checks.
- The change must include a repeatable validation command that can be run locally and in CI to detect malformed OpenAPI syntax.
- The repository documentation must explain how to validate the OpenAPI contract.
- The repository documentation must explain how to view the OpenAPI contract, either through a local Swagger UI or an equivalent documentation viewer if the implementation chooses to provide one.
- The OpenAPI contract must be maintained as source-controlled project documentation, not generated only as uncommitted build output.
- Existing endpoint behavior and tests must continue to pass unchanged unless an aligned OpenSpec artifact explicitly expands scope.

## Risks

- The contract can drift from runtime behavior if it is handwritten without a meaningful validation or review workflow.
- Syntax validation alone cannot prove that the contract matches the Express implementation or tests.
- Adding a documentation viewer can introduce dependencies and local workflow complexity beyond the value needed for the first contract.
- Over-specifying examples or schemas can accidentally imply API guarantees that current behavior does not satisfy.
- Future API changes may skip contract updates unless the delivery workflow makes OpenAPI updates part of API review.

## Open questions

- Owner: Product/Developer. Should `add-openapi-contract` include a local Swagger UI route or script in the first implementation, or is a static viewer command/documented external viewer enough?
- Owner: Developer/QA. Should CI only validate OpenAPI syntax initially, or should it also compare selected contract examples against integration tests?
- Owner: Developer. Where should the canonical OpenAPI file live: repository root, `docs/`, or a dedicated API contract directory?
- Owner: Developer. Should the OpenAPI contract be authored manually, generated from Zod schemas, or produced through a hybrid workflow?
- Owner: Product. Should `GET /audit-log` audit event schema document internal event ID and timestamp formats as stable public contract fields?

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/13
- OpenSpec change id requested by issue: `add-openapi-contract`
- Current behavior sources: `openspec/specs/flags-api/spec.md`, `openspec/specs/flag-evaluation/spec.md`, `openspec/specs/audit-log/spec.md`, `src/api/app.ts`, and `src/domain/schemas.ts`
