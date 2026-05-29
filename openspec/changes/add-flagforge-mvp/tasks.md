## 1. Project Setup

- [ ] 1.1 Configure npm scripts for `dev`, `test`, `typecheck`, and `lint`
- [ ] 1.2 Adjust TypeScript configuration for the planned `src` and test structure
- [ ] 1.3 Add minimal ESLint configuration compatible with the TypeScript service

## 2. Domain Model

- [ ] 2.1 Define feature flag, rule, evaluation context, and evaluation result types
- [ ] 2.2 Implement Zod schemas for create, update, rule, and evaluation request payloads
- [ ] 2.3 Implement an in-memory flag repository with create, list, get, and update operations
- [ ] 2.4 Implement a pure flag evaluator for enabled state, `equals` rules, and `in` rules

## 3. REST API

- [ ] 3.1 Create an Express app factory with JSON middleware and health endpoint
- [ ] 3.2 Implement `POST /flags` with validation, duplicate-key handling, and HTTP 201 response
- [ ] 3.3 Implement `GET /flags` and `GET /flags/:key`
- [ ] 3.4 Implement `PATCH /flags/:key` without allowing key changes
- [ ] 3.5 Implement `POST /flags/:key/evaluate`
- [ ] 3.6 Implement consistent JSON error responses for validation, conflict, and not-found cases
- [ ] 3.7 Add a server entrypoint for local development

## 4. Tests

- [ ] 4.1 Add unit tests for enabled flags, disabled flags, matching rules, and non-matching rules
- [ ] 4.2 Add Supertest integration tests for health, create, list, read, update, and evaluate success paths
- [ ] 4.3 Add Supertest integration tests for validation errors, duplicate keys, and missing flags
- [ ] 4.4 Ensure each test gets isolated in-memory state

## 5. CI

- [ ] 5.1 Add a GitHub Actions workflow for pushes and pull requests
- [ ] 5.2 Configure the workflow to run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm test`

## 6. Verification

- [ ] 6.1 Run the full local quality gate: typecheck, lint, and tests
- [ ] 6.2 Review implementation against the OpenSpec requirements and update task checkboxes
