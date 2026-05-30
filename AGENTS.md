# Repository Guidelines

## Agent Context

Read `docs/context.md` for the project context map and `docs/decision-log.md` for recorded architectural and workflow decisions. Keep these files updated when important project knowledge or decisions move from chat into the repository.

## Project Structure & Module Organization

FlagForge is a TypeScript/Node.js feature flag API. Runtime code lives in `src/`: `src/server.ts` starts the Express server, `src/api/` contains HTTP routing and error handling, and `src/domain/` contains flag types, Zod schemas, repository logic, and evaluation behavior. Tests live in `test/` and mirror the API/domain split with files such as `test/app.test.ts` and `test/evaluator.test.ts`. OpenSpec requirements and archived change artifacts are under `openspec/`.

## Build, Test, and Development Commands

- `npm run dev`: starts the local server with `tsx watch src/server.ts`.
- `npm test`: runs the Vitest suite once.
- `npm run typecheck`: runs `tsc --noEmit` against `src/`, `test/`, and config files.
- `npm run lint`: runs ESLint across the repository.
- `npm run format`: formats files with Prettier.
- `npm run format:check`: checks Prettier formatting without rewriting files.
- `npm run verify`: runs typecheck, lint, formatting checks, tests, and strict OpenSpec validation.

Run `npm install` after dependency changes. The package is ESM (`"type": "module"`), so keep local TypeScript imports compatible with NodeNext resolution, including `.js` extensions for relative runtime imports.

## Coding Style & Naming Conventions

Use TypeScript with strict compiler settings. Prefer small, focused modules and keep HTTP concerns in `src/api/` while domain rules remain in `src/domain/`. Use two-space indentation as produced by Prettier. Name types and classes in `PascalCase`, functions and variables in `camelCase`, and feature flag keys in lowercase kebab case, for example `checkout-redesign`. Validate external input with Zod schemas before passing data into domain logic.

## Testing Guidelines

Vitest is configured with globals and the Node environment. Name test files `*.test.ts` and place them in `test/`. Use Supertest for Express endpoint coverage and direct Vitest assertions for domain behavior. Add or update tests for every behavior change, especially API status codes, error payloads, schema validation, and flag evaluation rules. Before opening a PR or considering implementation complete, run `npm run verify`. If verification fails, fix only failures directly related to the current change and report unrelated failures without broad cleanup.

Use OpenSpec before implementing behavior changes. Do not introduce persistence unless the active OpenSpec change requests it, and do not change public API behavior without updating OpenSpec specs.

## Commit & Pull Request Guidelines

Use Conventional Commits for commit messages, for example `feat: add flag evaluation endpoint`, `fix: reject invalid flag keys`, or `docs: update agent guidance`. Keep commits focused and describe the user-visible change. Pull requests should include a concise summary, test results, linked issue or OpenSpec change when relevant, and API examples or screenshots only when they clarify behavior.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep generated build output such as `dist/` out of source edits unless explicitly required. Treat request bodies and route parameters as untrusted input; update schemas in `src/domain/schemas.ts` alongside any API contract change.
