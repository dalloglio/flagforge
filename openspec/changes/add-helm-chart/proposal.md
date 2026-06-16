## Why

FlagForge needs Kubernetes packaging before it can run consistently in the Level 1 local platform path with kind and later GitOps workflows. Helm is the accepted packaging direction, but the repository does not yet provide a chart for deploying the API runtime and its local configuration.

## What Changes

- Add a Helm chart for the FlagForge API runtime with local-first defaults.
- Make image, container port, service port/type, environment variables, and health/readiness probes configurable through values.
- Provide a local values file suitable for a future kind deployment path.
- Add documented chart render/lint validation commands where feasible.
- Update README and local runbook documentation with chart usage, local values, and validation steps.
- Keep Argo CD, Kong deployment, chart publishing, and AWS/EKS production values out of this change.

## Capabilities

### New Capabilities

- `local-helm-packaging`: Defines Helm chart packaging, local values, Kubernetes service/probe configuration, and chart validation for deploying the FlagForge API in the Level 1 local platform path.

### Modified Capabilities

- None.

## Impact

- Adds Kubernetes packaging files for the API chart and local values.
- Adds or documents Helm validation commands without making Docker, Kubernetes, or external services part of the host-only `npm run verify` gate.
- Updates README and local development runbook documentation.
- Does not change public REST API behavior, domain logic, persistence behavior, Argo CD configuration, Kong configuration, or cloud infrastructure.
