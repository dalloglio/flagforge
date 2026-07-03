# RDS PostgreSQL AWS Review Notes

Use these notes when reviewing the `add-rds-postgres-aws` implementation.

## Staff Review

- Confirm the RDS PostgreSQL module lives under `infra/aws/modules/` and the `dev` live composition stays under `infra/aws/live/dev/us-east-1/`.
- Confirm the module consumes network references as inputs and does not create VPC, subnet, route table, NAT gateway, internet gateway, or security-group resources.
- Confirm the committed `dev` composition is a static contract target and not account-backed plan/apply-ready until future networking, account, and remote-state changes provide real dependencies.
- Confirm the application PostgreSQL contract remains unchanged: existing SQL migrations, connection configuration shape, API behavior, domain behavior, flag evaluation, audit-log behavior, and OpenAPI contract.
- Confirm future deployment work can consume endpoint, port, database name, username reference, managed secret reference, and network dependency references without redefining the database contract.

## SRE Review

- Confirm cost drivers are documented: instance class, storage, backup retention, final snapshots, CloudWatch logs, data transfer, KMS, Enhanced Monitoring, and Performance Insights.
- Confirm operational settings are explicit: encryption, backup retention, maintenance window, deletion protection, final snapshot behavior, logging, monitoring, and parameter group deferral.
- Confirm rollback guidance distinguishes code rollback, planned resource cleanup, state recovery, and data-preserving remediation.
- Confirm default verification, CI, package scripts, Make targets, docs, and runbooks keep static validation separate from account-backed plan/apply/destroy/import/state mutation.
- Confirm missing OpenTofu, Terragrunt, or provider plugin prerequisites are treated as local tooling issues rather than reasons to add AWS credentials to default workflows.

## Security/LGPD Review

- Confirm public database exposure is not the default access pattern.
- Confirm examples, tags, names, inputs, outputs, docs, and mock network values avoid real account IDs, personal data, customer data, personal profile names, SSO URLs, production-only identifiers, copied tokens, and secrets.
- Confirm the first credential pattern uses RDS-managed master password references and does not accept or output a plaintext database password.
- Confirm the managed master secret ARN is marked sensitive and generated state, plans, logs, provider files, module caches, outputs, and secret references are handled as sensitive artifacts.
- Confirm future IAM/OIDC, secret-management, and account-backed workflows remain separate reviewed changes.

## QA Review

- Confirm OpenSpec strict validation passes for `add-rds-postgres-aws`.
- Confirm `npm run verify` passes without AWS credentials, OpenTofu, Terragrunt, remote state, live RDS, or cloud provisioning.
- Confirm optional IaC formatting and static validation are documented separately and do not run plan, apply, destroy, import, state mutation, force-unlock, taint, or auto-approve commands.
- Confirm local PostgreSQL versus AWS RDS differences are documented for connection source, credential source, TLS expectation, migration execution, network reachability, and environment settings.
- Confirm no application source or public API contract changes were introduced by this infrastructure target.
