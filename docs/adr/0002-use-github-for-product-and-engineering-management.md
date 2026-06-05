# 0002 - Use GitHub for Product and Engineering Management

## Status

Accepted

## Context

FlagForge needs a visible, low-overhead management workflow appropriate for a public portfolio and study project.

## Decision

Use GitHub Projects, Issues, Pull Requests, and Wiki for planning, delivery tracking, contribution workflow, and navigable documentation.

## Rationale

GitHub keeps product and engineering artifacts close to code and avoids adding Jira or Confluence overhead before the project needs it.

## Consequences

- GitHub Issues replace tickets.
- GitHub Projects replace delivery boards.
- GitHub Wiki can host navigable documentation.
- Versioned docs stay in the repository when they must be reviewable with code.
- PR and issue templates shape contribution intake.

## Alternatives considered

- Jira and Confluence: realistic in enterprise settings, but too heavy for the current project.
- Repository docs only: versioned, but weaker for issue intake and board-level tracking.

## Follow-up changes

- Add GitHub issue templates and a pull request template.
- Decide later whether Wiki content should mirror selected `docs/` content.
