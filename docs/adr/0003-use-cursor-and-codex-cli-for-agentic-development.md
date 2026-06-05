# 0003 - Use Cursor and Codex CLI for Agentic Development

## Status

Accepted

## Context

The project is explicitly used to practice agent-assisted software delivery with both editor-integrated and terminal-based workflows.

## Decision

Use Cursor and Codex CLI as the primary agentic development tools.

## Rationale

Cursor supports editor-centric iteration, while Codex CLI supports terminal-driven repository work, OpenSpec workflows, verification, and context engineering.

## Consequences

- Repository guidance must be useful to both tools.
- Durable context must live in files rather than chat memory.
- Tool-specific behavior should not become the only source of truth.
- Agent outputs should be verified through the same project harness as human-authored changes.

## Alternatives considered

- Use only one agentic tool: simpler, but misses the comparison and workflow-learning goal.
- Keep instructions only in tool settings: convenient locally, but not portable or reviewable.

## Follow-up changes

- Keep `AGENTS.md`, `docs/context/`, templates, and playbooks aligned with actual workflow.
