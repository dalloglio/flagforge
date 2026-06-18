## 1. Local Argo CD Desired State

- [ ] 1.1 Add source-controlled local Argo CD application configuration under an infrastructure-oriented path.
- [ ] 1.2 Point the desired-state entrypoint at the existing FlagForge Helm chart and local values.
- [ ] 1.3 Use a reusable mainline-safe target revision in the committed desired-state artifact.
- [ ] 1.4 Keep Argo CD configuration out of application source and free of production secrets.
- [ ] 1.5 Avoid Argo CD-specific raw workload manifests that duplicate the existing kind/Helm deployment path.

## 2. GitOps Workflow Documentation

- [ ] 2.1 Document prerequisites for local Kubernetes, Argo CD access, kubectl, and Argo CD CLI or UI usage.
- [ ] 2.2 Document the dependency on the existing kind and Helm workflow before Argo CD reconciliation.
- [ ] 2.3 Document how to apply or register the FlagForge application and sync it locally.
- [ ] 2.4 Document how to override the local Argo CD application target revision for a pushed feature branch or commit SHA without committing branch-specific revisions.
- [ ] 2.5 Document how to inspect sync status, health status, drift, and resync behavior.

## 3. Validation and Operations

- [ ] 3.1 Add a documented validation path that proves the Argo CD application reaches synced or actionable failure state.
- [ ] 3.2 Add runtime validation that proves a FlagForge operational endpoint is reachable after sync.
- [ ] 3.3 Add cleanup guidance for removing the local Argo CD application or resetting local GitOps state.
- [ ] 3.4 Document Level 1 local scope limits and local-safe secret handling.
- [ ] 3.5 State that local-safe secret handling is not a production secret management strategy.

## 4. Verification

- [ ] 4.1 Run strict OpenSpec validation for `add-argocd-gitops`.
- [ ] 4.2 Run repository verification or document why platform-only prerequisites prevent full local execution.
- [ ] 4.3 Confirm `npm run verify` remains independent from Argo CD, Docker, Kubernetes, Helm, PostgreSQL services, and synced applications.
