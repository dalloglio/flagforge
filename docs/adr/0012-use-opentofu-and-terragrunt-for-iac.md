# 0012 - Use OpenTofu and Terragrunt for IaC

## Status

Accepted

## Context

AWS platform work will need repeatable infrastructure provisioning and environment composition.

## Decision

Use OpenTofu as the preferred IaC runtime and Terragrunt for composition, environment management, and DRY infrastructure configuration.

## Rationale

OpenTofu provides an open IaC runtime, while Terragrunt helps manage multi-environment structure and shared modules.

## Consequences

- IaC is future work and should not be introduced before the relevant platform change.
- Terragrunt can structure local, staging-like, and cloud environment configuration later.
- Atlantis and module registry workflows remain advanced future options.

## Alternatives considered

- Terraform only: familiar, but OpenTofu is the selected runtime.
- Handwritten cloud setup: fast once, but not repeatable or reviewable.

## Follow-up changes

- Add IaC only when AWS platform work begins.
