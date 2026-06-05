# 0017 - Use Versioned Context Engineering Assets

## Status

Accepted

## Context

Agent-assisted work can drift when important context remains only in chat or local memory.

## Decision

Store durable context engineering assets in versioned repository files.

## Rationale

Versioned context lets Codex, Cursor, contributors, and reviewers share the same project map and decision history.

## Consequences

- `docs/context.md` remains the compact map.
- `docs/context/` contains focused context documents.
- `docs/adr/` contains accepted durable decisions.
- `docs/templates/` and `docs/agent-playbooks/` are reusable workflow assets.
- Chat can explain, but repository files are the durable source.

## Alternatives considered

- Keep context in chat: convenient, but not reviewable or reusable.
- Keep context in one large file: simple, but harder to scan as the project grows.

## Follow-up changes

- Update context assets whenever future changes add durable knowledge.
