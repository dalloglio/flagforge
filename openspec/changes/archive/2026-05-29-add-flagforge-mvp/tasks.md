## 1. Project Setup

- [x] 1.1 Configure npm scripts for `dev`, `test`, `typecheck`, and `lint`
- [x] 1.2 Adjust TypeScript configuration for the planned `src` and test structure
- [x] 1.3 Add minimal ESLint configuration compatible with the TypeScript service

## 2. Domain Model

- [x] 2.1 Define feature flag, rule, evaluation context, and evaluation result types
- [x] 2.2 Implement Zod schemas for create, update, rule, and evaluation request payloads
- [x] 2.3 Implement an in-memory flag repository with create, list, get, and update operations
- [x] 2.4 Implement a pure flag evaluator for enabled state, `equals` rules, and `in` rules

## 3. REST API

- [x] 3.1 Create an Express app factory with JSON middleware and health endpoint
- [x] 3.2 Implement `POST /flags` with validation, duplicate-key handling, and HTTP 201 response
- [x] 3.3 Implement `GET /flags` and `GET /flags/:key`
- [x] 3.4 Implement `PATCH /flags/:key` without allowing key changes
- [x] 3.5 Implement `POST /flags/:key/evaluate`
- [x] 3.6 Implement consistent JSON error responses for validation, conflict, and not-found cases
- [x] 3.7 Add a server entrypoint for local development

## 4. Tests

- [x] 4.1 Add unit tests for enabled flags, disabled flags, matching rules, and non-matching rules
- [x] 4.2 Add Supertest integration tests for health, create, list, read, update, and evaluate success paths
- [x] 4.3 Add Supertest integration tests for validation errors, duplicate keys, and missing flags
- [x] 4.4 Ensure each test gets isolated in-memory state

## 5. CI

- [x] 5.1 Add a GitHub Actions workflow for pushes and pull requests
- [x] 5.2 Configure the workflow to run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm test`

## 6. Verification

- [x] 6.1 Run the full local quality gate: typecheck, lint, and tests
- [x] 6.2 Review implementation against the OpenSpec requirements and update task checkboxes
