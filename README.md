# FlagForge

FlagForge is a small TypeScript/Express feature flag API used to practice OpenSpec-driven development, testing, delivery workflow design, and future platform engineering.

The current runtime persists feature flags and audit events in PostgreSQL, evaluates flags deterministically from request context, supports simple targeting rules and percentage rollouts, and exposes an audit log for successful flag mutations.

## Current Capabilities

- Create and update feature flags.
- Evaluate feature flags through an HTTP API.
- Validate external input with Zod.
- Apply deterministic percentage rollouts.
- Record and list durable audit events for flag mutations.
- Persist feature flags and audit events in PostgreSQL.
- Verify behavior with Vitest, Supertest, TypeScript, ESLint, Prettier, and OpenSpec validation.

## Delivery Model

OpenSpec is the source of truth for behavior changes. Durable decisions live in `docs/adr/`, focused context lives in `docs/context/`, and reusable delivery assets live in `docs/templates/` and `docs/agent-playbooks/`.

## Commands

```bash
npm install
npm run db:migrate
npm run dev
npm test
npm run test:postgres
npm run verify
```

Use `npm run verify` before treating implementation work as complete.

## Local PostgreSQL

Start the local database with Docker Compose:

```bash
docker compose up -d postgres
```

Use this non-secret local connection string for development:

```bash
export DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge
```

Apply migrations before starting the API:

```bash
npm run db:migrate
npm run dev
```

PostgreSQL integration tests require a real database. Point them at a database with `TEST_DATABASE_URL`; if it is omitted, the harness uses `DATABASE_URL`.
