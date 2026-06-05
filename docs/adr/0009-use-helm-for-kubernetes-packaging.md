# 0009 - Use Helm for Kubernetes Packaging

## Status

Accepted

## Context

FlagForge will eventually deploy application and platform components into Kubernetes locally and in AWS.

## Decision

Use Helm for Kubernetes packaging.

## Rationale

Helm is widely used, works with Argo CD, and supports parameterized packaging across local and future cloud environments.

## Consequences

- Kubernetes deployment work should package the API with a Helm chart.
- Values files should separate local and future cloud concerns.
- Helm chart behavior must not be claimed before implementation.

## Alternatives considered

- Raw Kubernetes YAML: simple initially, but harder to evolve across environments.
- Kustomize only: useful, but Helm aligns with the selected GitOps path.

## Follow-up changes

- Add a Helm chart in a future platform change.
