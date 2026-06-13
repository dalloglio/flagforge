# PRD: add-kong-gateway-local

## Problem

FlagForge needs to practice gateway-level delivery before moving to cloud. The
accepted platform direction uses Kong Gateway self-hosted in a Kubernetes
cluster, first locally and later in AWS. The project needs a local Kong
integration that routes traffic to the API without coupling the Express
application to Kong.

Without a reproducible local gateway path, future rate limiting, authentication
handoff, Helm, kind, and GitOps work lacks a concrete gateway baseline to extend
and validate.

## Goals

- Add local Kong Gateway support for routing traffic to the FlagForge API.
- Keep direct app behavior unchanged.
- Keep application code independent from Kong-specific runtime assumptions.
- Document a reproducible local startup and validation flow.
- Add or document gateway routing smoke checks where feasible.
- Prepare configuration structure that can be reused by future Helm, kind, or
  GitOps work where appropriate.

## Non-goals

- Rate limiting policy.
- Admin API authentication changes.
- Helm chart.
- kind cluster installation.
- Argo CD application definitions.
- AWS, EKS, ALB, or cloud deployment.
- Production gateway hardening.
- Replacing direct local app access with gateway-only access.

## Users

- Developers validating FlagForge behind a local gateway.
- Contributors preparing Level 1 local platform work.
- QA reviewers checking gateway routing behavior and direct app regressions.
- SRE reviewers assessing local runbook clarity and failure modes.
- Security reviewers checking exposed routes, headers, and accidental admin
  surface exposure.

## Requirements

- OpenSpec artifacts must define local Kong Gateway behavior before
  implementation.
- Kong must be able to route local traffic to the FlagForge API.
- Direct access to the app must continue to behave as it does today unless the
  OpenSpec change explicitly changes that behavior.
- Gateway configuration must be source-controlled, documented, and reproducible.
- Local startup documentation must explain how to run the app and Kong together.
- Local validation documentation must explain how to prove traffic reaches
  FlagForge through Kong.
- A smoke check must demonstrate successful gateway routing where feasible in
  local tooling or CI.
- The API code must not import, configure, or depend on Kong.
- Gateway configuration must avoid introducing admin authentication, rate
  limiting, cloud deployment, Helm, kind, or Argo CD scope.
- The configuration structure should avoid blocking future reuse by Helm, kind,
  or GitOps work.
- Security review must confirm that gateway routing does not accidentally expose
  unintended admin surfaces or misleading security guarantees.

## Risks

- Kong configuration can become coupled to Docker Compose details in a way that
  is hard to adapt to later kind or Helm work.
- A gateway smoke check can give false confidence if it only checks Kong uptime
  rather than routing through to the API.
- Introducing Kong can obscure whether failures are in the app, gateway, network,
  or configuration unless runbooks include clear troubleshooting steps.
- Gateway routing can accidentally imply production hardening, authentication, or
  rate limiting that this issue explicitly excludes.
- Adding gateway config before admin auth is complete can expose the same
  unauthenticated admin surface through a second entrypoint if route scope is not
  reviewed.

## Open questions

- Owner: Staff/SRE. Should the first local Kong integration run only through
  Docker Compose, or should it also prepare a directory layout for later kind and
  Helm work?
- Owner: QA/SRE. Should gateway smoke checks be part of `npm run verify`, a
  Makefile target, or an explicit Docker-only validation command?
- Owner: Security. Which routes should be exposed through Kong in the first
  implementation while admin authentication is being handled separately?
- Owner: Developer. What host ports should Kong use to avoid conflicts with the
  existing app and PostgreSQL Compose defaults?

## Source references

- GitHub issue: https://github.com/dalloglio/flagforge/issues/19
- OpenSpec change id requested by issue: `add-kong-gateway-local`
- Relevant docs: `docs/adr/0006-use-level-1-local-platform-before-cloud.md`,
  `docs/adr/0011-use-kong-as-self-hosted-api-gateway.md`,
  `docs/adr/0016-use-hexagonal-architecture-and-ddd-lite.md`,
  `docs/context/architecture.md`, and `docs/context/delivery-workflow.md`
