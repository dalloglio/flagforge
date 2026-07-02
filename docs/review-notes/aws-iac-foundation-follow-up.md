# AWS IaC Foundation Follow-Up Review Notes

Use these notes before any future resource-producing AWS change.

## Staff Review

- Confirm the change is covered by a separate OpenSpec proposal, design, specs, and tasks.
- Confirm module boundaries and live Terragrunt composition keep environment decisions out of reusable modules.
- Confirm account, region, remote-state, and resource sequencing decisions are explicit.
- Confirm the change does not make this foundation look like production readiness before the required platform pieces exist.

## SRE Review

- Confirm validation, future plan, and future apply workflows remain separate.
- Confirm rollback distinguishes code rollback, cleanup or planned destroy, state recovery, and data-preserving remediation.
- Confirm remote-state work defines locking, encryption, versioning, recovery, state migration, lock-failure handling, retention, and disposal.
- Confirm generated state, plan, provider, cache, output, and command-log artifacts are handled as sensitive.
- Confirm expected monthly cost impact and cleanup evidence are documented.

## Security/LGPD Review

- Confirm examples, variables, outputs, tags, resource names, docs, and generated artifacts avoid personal data, customer data, real account IDs, secrets, profile names, SSO URLs, and production-only identifiers.
- Confirm IAM/OIDC uses least privilege, scoped trust relationships, short-lived credentials, environment-specific roles, and explicit audience or subject constraints where applicable.
- Confirm administrator defaults, wildcard defaults, broad principals, long-lived access keys, and shared personal credentials are not used.
- Confirm local AWS profiles are optional placeholders and are not required for credential-free validation.
