## ADDED Requirements

### Requirement: ECR image repository contract

FlagForge SHALL define AWS Elastic Container Registry as the target registry for published API container images.

#### Scenario: Registry target is documented

- **WHEN** a contributor reads the image publishing documentation
- **THEN** it identifies AWS ECR as the registry target
- **AND** it identifies the application image repository name as `flagforge-api`
- **AND** it identifies the first environment as `dev`
- **AND** it identifies the first AWS region as `us-east-1`

#### Scenario: Image URI uses placeholders

- **WHEN** documentation shows an account-backed image reference
- **THEN** it uses the placeholder account value `<aws-account-id>`
- **AND** it uses the URI shape `<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api:<tag>`
- **AND** it does not include real account IDs, credentials, personal data, customer data, or production-only identifiers

#### Scenario: Future deployment consumers have a stable handoff

- **WHEN** a future EKS, Helm, or Argo CD change needs an image reference
- **THEN** it can consume the documented ECR repository, region, environment, and tag contract without redefining registry naming

### Requirement: ECR publishing prerequisites

FlagForge SHALL treat account-backed ECR repository provisioning as a prerequisite managed outside this change.

#### Scenario: Provisioning ownership is explicit

- **WHEN** a contributor reads the image publishing documentation
- **THEN** it states that the ECR repository, lifecycle policy, IAM/OIDC role, and account-backed configuration are prerequisites for a future OpenSpec change
- **AND** it states that this change does not create ECR IaC

#### Scenario: Infrastructure mutation remains out of scope

- **WHEN** a contributor inspects package scripts, CI workflows, Makefile targets, and documentation added by this change
- **THEN** no default command runs `tofu plan`, `terragrunt plan`, `tofu apply`, `terragrunt apply`, `tofu destroy`, `terragrunt destroy`, `tofu import`, or equivalent account-backed or state-mutating commands
- **AND** no default command requires remote state, AWS credentials, or live cloud resources

### Requirement: Publish-capable GitHub Actions workflow

FlagForge SHALL provide or define a GitHub Actions workflow that can publish the FlagForge API image only from trusted events and only when explicit activation prerequisites are satisfied.

#### Scenario: Publish workflow uses trusted events

- **WHEN** a contributor inspects the publish-capable workflow
- **THEN** it is publish-capable only for protected `main` branch pushes and manual `workflow_dispatch` runs
- **AND** it does not publish images for pull request events

#### Scenario: Publish job is disabled until prerequisites are activated

- **WHEN** the ECR repository, IAM/OIDC role, branch protection, and GitHub environment protection prerequisites are not yet provisioned and reviewed
- **THEN** the publish-capable workflow does not attempt ECR authentication or ECR push for automatic `main` branch runs
- **AND** publish execution requires an explicit activation setting such as `ECR_PUBLISHING_ENABLED=true`
- **AND** documentation states that enabling the activation setting belongs to a future account-backed prerequisite change

#### Scenario: Publish workflow uses canonical build behavior

- **WHEN** the publish-capable workflow builds the FlagForge API image
- **THEN** it uses the repository Dockerfile from the repository root
- **AND** it calls canonical repository commands or documented Docker commands where practical instead of duplicating application build internals in workflow YAML

#### Scenario: Local verification remains host-only

- **WHEN** a contributor runs `npm run verify`
- **THEN** the command does not require AWS credentials, ECR access, Docker, remote state, or live cloud resources
- **AND** image publishing remains outside the local verification gate

### Requirement: Registry authentication and authorization

FlagForge SHALL use short-lived GitHub-to-AWS identity for image publishing.

#### Scenario: Publish workflow assumes scoped AWS role

- **WHEN** the publish-capable workflow authenticates to AWS
- **THEN** it uses short-lived credentials such as GitHub Actions OIDC
- **AND** it identifies the expected role name as `flagforge-github-actions-ecr-publisher-dev`
- **AND** it identifies the GitHub environment as `aws-dev`

#### Scenario: Long-lived credentials are not required

- **WHEN** a contributor inspects workflow configuration and documentation for image publishing
- **THEN** it does not require committed AWS access keys, shared personal credentials, copied cloud tokens, or personal workstation credentials

#### Scenario: ECR permissions are least privilege

- **WHEN** documentation describes the publish role permissions
- **THEN** it scopes permissions to the minimum ECR actions needed to authenticate, upload image layers, push manifests, and read vulnerability findings for `flagforge-api`
- **AND** it does not present administrator policies, broad principals, wildcard resource access, or long-lived credentials as defaults

#### Scenario: Repository protection assumptions are documented

- **WHEN** a contributor reads the image publishing documentation
- **THEN** it identifies protected `main` branch pushes and the `aws-dev` GitHub environment as part of the publishing trust boundary
- **AND** it states that branch protection and environment protection must be validated before enabling ECR publishing

### Requirement: Image tagging and provenance

FlagForge SHALL publish images with reviewable and commit-addressable tags.

#### Scenario: Published image uses date and short SHA tag

- **WHEN** the publish-capable workflow tags an image
- **THEN** it creates a tag using the format `<yyyymmdd>.<short-sha>`
- **AND** examples use a tag such as `20260704.abcd123`

#### Scenario: Deployable references are not mutable-only

- **WHEN** documentation describes deployable image references
- **THEN** it states that mutable-only tags such as `latest` are not sufficient as the only deployable reference
- **AND** it requires future deployment consumers to use a specific published image tag or another reviewed immutable reference

#### Scenario: Image metadata avoids sensitive values

- **WHEN** workflow outputs, build metadata, logs, or documentation include image references
- **THEN** they avoid secrets, tokens, personal data, customer data, real account IDs, and production-only identifiers

### Requirement: Image vulnerability gate

FlagForge SHALL define image vulnerability visibility and publish blocking expectations for high and critical findings before images are pushed to ECR.

#### Scenario: Publish blocks high and critical findings

- **WHEN** the publish-capable workflow evaluates image vulnerability findings
- **THEN** it runs Trivy against the locally built image before ECR login and push
- **AND** publishing is not accepted when high or critical findings are present
- **AND** the workflow fails with enough context for reviewers to identify the failing image security gate without exposing secrets

#### Scenario: Scanner behavior is explicit

- **WHEN** a contributor inspects the publish-capable workflow
- **THEN** the image scanner, severity threshold, and failure behavior are explicit in workflow configuration
- **AND** the workflow does not rely on asynchronous ECR scan completion as the first high or critical vulnerability gate

#### Scenario: Security review gate is documented

- **WHEN** a contributor reads the image publishing documentation
- **THEN** it identifies Security/LGPD review as required before CI-to-AWS identity or publish capability is accepted
- **AND** it identifies vulnerability visibility as part of that review

### Requirement: Retention cleanup and cost expectations

FlagForge SHALL document ECR retention, cleanup, and cost expectations for published images.

#### Scenario: Retention policy expectation is documented

- **WHEN** a contributor reads the image publishing documentation
- **THEN** it states that the expected ECR retention policy keeps the last three tagged images
- **AND** it states that older untagged images are expected to be deleted after seven days
- **AND** it states that enforcement belongs to the future ECR provisioning change

#### Scenario: Cost growth is bounded by review expectations

- **WHEN** a contributor reviews the image publishing scope
- **THEN** it identifies ECR storage cost as a concern
- **AND** it requires retention and cleanup expectations to be reviewed before publish capability is accepted

### Requirement: Rollback and deployment handoff

FlagForge SHALL document how future deployment consumers select a prior known-good image.

#### Scenario: Prior image can be selected for rollback

- **WHEN** future deployment work needs to roll back an application image
- **THEN** documentation explains that a prior known-good `<yyyymmdd>.<short-sha>` image tag can be selected
- **AND** rollback does not depend on mutable-only tags

#### Scenario: Required review gates are visible

- **WHEN** the OpenSpec change is reviewed before implementation
- **THEN** Staff review covers image and versioning strategy
- **AND** SRE review covers publishing reliability, retention, cleanup, and rollback implications
- **AND** Security/LGPD review covers registry access, CI identity, vulnerability gates, secrets, logs, and metadata exposure
- **AND** QA review covers validation of the build and publish path
