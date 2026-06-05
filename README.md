# FlagForge

FlagForge is a small TypeScript/Express feature flag API used to practice OpenSpec-driven development, testing, delivery workflow design, and future platform engineering.

The current runtime is intentionally small: it manages feature flags in memory, evaluates them deterministically from request context, supports simple targeting rules and percentage rollouts, and exposes an audit log for successful flag mutations.

## Current Capabilities

- Create and update feature flags.
- Evaluate feature flags through an HTTP API.
- Validate external input with Zod.
- Apply deterministic percentage rollouts.
- Record and list in-memory audit events for flag mutations.
- Verify behavior with Vitest, Supertest, TypeScript, ESLint, Prettier, and OpenSpec validation.

## Delivery Model

OpenSpec is the source of truth for behavior changes. Durable decisions live in `docs/adr/`, focused context lives in `docs/context/`, and reusable delivery assets live in `docs/templates/` and `docs/agent-playbooks/`.

Future work will add PostgreSQL persistence and local platform simulation through dedicated OpenSpec changes. Those capabilities are documented as decisions and targets, not current runtime behavior.

## Commands

```bash
npm install
npm run dev
npm test
npm run verify
```

Use `npm run verify` before treating implementation work as complete.
