## ADDED Requirements

### Requirement: Versioned current project status

The repository SHALL maintain a versioned current project status document that records the active lifecycle state, summarizes roadmap completion, distinguishes implemented local behavior from statically validated contracts and externally dependent live execution, and identifies current limitations without claiming unsupported production readiness.

#### Scenario: Completed roadmap status is documented

- **WHEN** a contributor or portfolio reviewer inspects the current project status
- **THEN** the document identifies whether the active roadmap is planned, in progress, completed, or in maintenance mode
- **AND** a completed portfolio roadmap is not presented as proof of a production SaaS or continuously operated production environment

#### Scenario: Evidence classes are explicit

- **WHEN** the current project status summarizes product or platform capabilities
- **THEN** it distinguishes capabilities implemented and exercised locally from contracts or desired state validated statically
- **AND** it identifies integrations that still depend on external accounts, credentials, configuration, secrets, or live infrastructure
- **AND** it identifies deliberately out-of-scope capabilities and optional future directions without converting them into committed backlog

#### Scenario: Status remains aligned after lifecycle decisions

- **WHEN** a reviewed maintenance change or future roadmap decision changes the lifecycle state, completion evidence, limitations, or committed scope
- **THEN** the current project status, README/context summaries, delivery workflow context, and repository agent guidance are updated in the same change or an explicitly linked documentation follow-up when affected
- **AND** historical ADRs and decision logs remain decision records rather than the sole source of current lifecycle status

#### Scenario: Release and external actions remain explicit

- **WHEN** the current project status describes release readiness or repository administration
- **THEN** it distinguishes source-controlled validation from external actions such as publishing a release, changing repository settings, closing issues, or archiving a project
- **AND** it does not claim that an external action occurred without point-in-time evidence
