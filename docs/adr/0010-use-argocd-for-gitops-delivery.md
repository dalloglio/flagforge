# 0010 - Use Argo CD for GitOps Delivery

## Status

Accepted

## Context

The project will practice GitOps delivery after local Kubernetes packaging exists.

## Decision

Use Argo CD for GitOps delivery, first in kind and later in EKS.

## Rationale

Argo CD makes desired state visible, integrates well with Helm, and is a common GitOps tool in Kubernetes environments.

## Consequences

- Git becomes the desired-state source for platform deployment.
- Argo CD configuration is future work, not part of the current API.
- Local Argo CD work should prepare for eventual AWS usage.

## Alternatives considered

- Manual `kubectl` deployment: simple, but does not practice GitOps.
- Flux: viable, but Argo CD was selected for this project.

## Follow-up changes

- Add Argo CD installation and application definitions after Helm/local Kubernetes work.
