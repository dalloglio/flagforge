## 1. Local Kind Configuration

- [ ] 1.1 Add source-controlled kind configuration under an infrastructure-oriented path.
- [ ] 1.2 Define the default local cluster name and document any supported override path.
- [ ] 1.3 Add thin Makefile targets or documented commands that call kind, kubectl, and Helm around source-controlled configuration.
- [ ] 1.4 Ensure configuration and helper files do not introduce production secrets, cloud-specific settings, or opaque orchestration scripts.

## 2. Deployment Workflow

- [ ] 2.1 Document the prerequisite sequence for Docker, kind, kubectl, Helm, image availability, in-cluster PostgreSQL readiness, and migrations.
- [ ] 2.2 Add documented commands or Makefile targets to create the cluster and deploy FlagForge through the existing Helm chart without adding raw API workload manifests.
- [ ] 2.3 Document the runtime configuration path for local-safe environment values, Kubernetes secrets, and an API `DATABASE_URL` that targets the in-cluster PostgreSQL service.
- [ ] 2.4 Document or add the local in-cluster PostgreSQL setup path and migration command sequence required before API readiness validation.

## 3. Validation and Operations

- [ ] 3.1 Add a documented smoke check that proves a FlagForge operational endpoint is reachable through the local kind access path after PostgreSQL and migrations are ready.
- [ ] 3.2 Add cleanup and reset instructions for deleting or recreating the local kind cluster.
- [ ] 3.3 Add troubleshooting guidance for missing CLIs, Docker state, image availability, cluster creation, PostgreSQL readiness, migration failures, and API readiness failures.
- [ ] 3.4 Make the runbook warning prominent that kind is a Level 1 local simulation and does not prove production Kubernetes readiness.

## 4. Verification

- [ ] 4.1 Run strict OpenSpec validation for `add-kind-local-k8s`.
- [ ] 4.2 Run repository verification or document why platform-only prerequisites prevent full local execution.
- [ ] 4.3 Confirm `npm run verify` remains independent from Docker, kind, kubectl, Helm, PostgreSQL services, and a running Kubernetes cluster.
