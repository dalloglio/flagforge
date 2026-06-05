# 0008 - Use kind for Local Kubernetes

## Status

Accepted

## Context

The local platform needs a Kubernetes environment that is easy to create, reset, and run on a developer machine.

## Decision

Use kind for local Kubernetes.

## Rationale

kind is lightweight, local, scriptable, and sufficient for practicing Helm, Argo CD, Kong, PostgreSQL, and observability deployment workflows.

## Consequences

- Local Kubernetes manifests and Helm charts should target kind first.
- Platform docs should make clear that kind is not production.
- Cluster setup and teardown should be automated in future changes.

## Alternatives considered

- Minikube: capable, but kind is simpler for container-based local clusters.
- Docker Compose only: useful for services, but insufficient for Kubernetes and GitOps practice.

## Follow-up changes

- Add kind setup in a future local platform OpenSpec change.
