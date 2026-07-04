# RDS PostgreSQL Module

This module defines the FlagForge AWS RDS PostgreSQL contract target. It is a
reviewable infrastructure contract for future AWS deployment work, not a
production-ready database topology by itself.

The module creates:

- one RDS DB subnet group from supplied private subnet IDs;
- one PostgreSQL RDS instance;
- no VPC, subnet, route table, internet gateway, NAT gateway, or security group
  resources.

## Credential Model

The first target uses `manage_master_user_password = true`, so AWS RDS generates
and manages the master password. The module accepts a non-secret master username
and exposes the managed secret ARN as a sensitive output for future deployment
work. It does not accept a database password input.

Future deployment work may consume the managed secret reference directly, derive
an application database user, or integrate with a separate secrets workflow. That
decision is intentionally outside this module.

## Final Snapshot

Final snapshots are enabled by default. When `skip_final_snapshot` is `false`
and no explicit `final_snapshot_identifier` is supplied, the module derives a
non-secret identifier from the DB identifier plus a generated suffix that is
stable for the current DB instance lifecycle. This avoids reusing a fixed final
snapshot name across repeated reviewed cleanup workflows.

Reviewed cleanup workflows may set `final_snapshot_identifier` explicitly when
operators need a pre-approved name. Keep that value non-sensitive and unique
among retained RDS snapshots in the target account.

## Network Contract

Network dependencies are required inputs:

- `private_subnet_ids`: private subnet IDs for the RDS subnet group.
- `vpc_security_group_ids`: database security group IDs that already allow only
  the intended application and migration sources.

These inputs must come from a future networking and remote-state change before
any account-backed plan or apply. Mock values in live composition are for static
shape review only and are invalid for real provisioning.

## Application Compatibility

FlagForge continues to use the existing PostgreSQL migration path under
`src/infrastructure/postgres/migrations/`. This module does not introduce an
AWS-only schema, migration runner, API behavior, domain behavior, flag
evaluation behavior, audit-log behavior, or OpenAPI contract change.

Future deployment work remains responsible for materializing the runtime
connection string or equivalent secret from this module's non-secret outputs and
sensitive secret reference.
