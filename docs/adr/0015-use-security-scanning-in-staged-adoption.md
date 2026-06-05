# 0015 - Use Security Scanning in Staged Adoption

## Status

Accepted

## Context

The project should practice security and LGPD-aware review without overloading the early MVP with every scanner at once.

## Decision

Adopt security scanning in stages, including CodeQL, Dependabot, Trivy, and OWASP ZAP when the project reaches the right maturity.

## Rationale

Staged adoption keeps the early learning loop manageable while preserving a clear security direction.

## Consequences

- Security scanning is future workflow/platform work.
- Each tool should be introduced by a dedicated change with clear validation.
- Security/LGPD playbooks guide review before automation is complete.
- Scanner findings should be triaged rather than treated as automatic broad cleanup.

## Alternatives considered

- Add all scanners immediately: thorough, but too much process before the platform exists.
- Ignore security until production: simpler, but poor learning discipline.

## Follow-up changes

- Add CodeQL, Dependabot, Trivy, and OWASP ZAP in staged future changes.
