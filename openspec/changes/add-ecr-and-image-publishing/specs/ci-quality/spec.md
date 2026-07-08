## MODIFIED Requirements

### Requirement: CI verifies build and Docker image

The CI workflow SHALL verify the application build and Docker image build in addition to existing quality gates, and SHALL keep validation-only CI separate from publish-capable image workflows.

#### Scenario: CI runs application build

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow runs `npm run build`

#### Scenario: CI runs Docker build

- **WHEN** GitHub Actions runs for the repository
- **THEN** the workflow builds the FlagForge Docker image without publishing it to a registry

#### Scenario: CI uses canonical commands

- **WHEN** GitHub Actions runs repository quality gates
- **THEN** named workflow steps call canonical npm scripts or documented Docker commands instead of duplicating Vitest, TypeScript, or migration internals in workflow YAML

#### Scenario: Pull request validation cannot publish images

- **WHEN** GitHub Actions runs validation for pull request events
- **THEN** the workflow builds the FlagForge Docker image without publishing it to ECR or another registry
- **AND** the workflow does not assume publish-capable AWS credentials

#### Scenario: Publish-capable workflow is separated from quality CI

- **WHEN** repository workflows include image publishing behavior
- **THEN** publish-capable behavior is isolated from the normal pull request quality workflow
- **AND** publish-capable events, permissions, environment, and AWS identity assumptions are explicit in the publishing workflow

#### Scenario: Automatic publishing is activation-gated

- **WHEN** repository workflows include image publishing behavior before AWS prerequisites are provisioned and reviewed
- **THEN** automatic `main` branch runs do not attempt ECR authentication or ECR push unless an explicit activation setting such as `ECR_PUBLISHING_ENABLED=true` is configured
- **AND** pull request validation remains unaffected by the activation setting
