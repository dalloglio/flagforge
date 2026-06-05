# 0011 - Use Kong as Self-Hosted API Gateway

## Status

Accepted

## Context

Future platform work needs an API gateway for routing and gateway-level delivery practice.

## Decision

Use Kong Gateway self-hosted in the Kubernetes cluster.

## Rationale

Kong is a common API gateway and can run locally in kind and later in EKS, making it useful for practicing gateway behavior without depending on a cloud-specific gateway first.

## Consequences

- Kong configuration is future platform work.
- The current Express API should not depend on Kong.
- Gateway behavior must be documented and tested when implemented.

## Alternatives considered

- Cloud-only gateway: useful later, but not aligned with local-first learning.
- No gateway: simpler, but misses an explicit platform learning target.

## Follow-up changes

- Add Kong through a future local platform OpenSpec change.
