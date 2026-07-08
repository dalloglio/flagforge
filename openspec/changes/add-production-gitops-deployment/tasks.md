## 1. Desired State

- [ ] 1.1 Create the AWS GitOps desired-state directory under `infra/aws/gitops/dev/us-east-1/`.
- [ ] 1.2 Add an Argo CD Application definition for the AWS `dev` target that points to `charts/flagforge-api` and uses AWS-specific Helm values.
- [ ] 1.3 Add AWS `dev` Helm values with placeholder ECR image repository and commit-addressable tag, ingress settings, runtime configuration, and existing Secret references.
- [ ] 1.4 Ensure committed desired-state examples avoid real account IDs, credentials, kubeconfigs, Argo CD credentials, cloud tokens, copied cloud outputs, personal data, customer data, production-only identifiers, and live secret values.

## 2. Documentation

- [ ] 2.1 Document the AWS GitOps deployment workflow, first target conventions, prerequisites, and dependency handoffs for EKS/ALB, RDS, ECR, Helm, and Argo CD.
- [ ] 2.2 Document promotion from a reviewed ECR image tag into AWS `dev` desired state, including pull request validation, merge, manual approval or environment protection, and sync ownership.
- [ ] 2.3 Document safe configuration and secret reference expectations, including external Secret ownership and production secret management boundaries.
- [ ] 2.4 Document live sync validation using Argo CD sync status, Argo CD health, Kubernetes rollout status, and FlagForge `/healthz` or `/readyz` through the ALB path.
- [ ] 2.5 Document drift inspection, desired-state rollback to a prior known-good image or configuration revision, cleanup of the Argo CD application target, and failed deployment escalation.

## 3. Validation

- [ ] 3.1 Add or document credential-free validation for AWS GitOps desired-state syntax and Helm rendering.
- [ ] 3.2 Keep live AWS, EKS, kubeconfig, Argo CD, Docker, ECR, RDS, ALB, and cloud-resource checks outside `npm run verify`.
- [ ] 3.3 Add focused tests or validation fixtures when implementation introduces scripts, wrappers, or generated-render expectations.
- [ ] 3.4 Run focused validation for the desired-state files and documentation.

## 4. Review And Completion

- [x] 4.1 Record Staff, SRE, Security/LGPD, and QA review gates before implementation is considered ready.
- [ ] 4.2 Confirm public API behavior, OpenAPI, domain behavior, database schema, migrations, image publishing tag strategy, and local platform behavior remain unchanged.
- [ ] 4.3 Run `npm run verify` and strict OpenSpec validation before marking implementation complete.
