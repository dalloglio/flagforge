# Domain Glossary

## Feature flag

A named configuration object that controls whether a feature is considered enabled for a request context.

## Flag key

The stable lowercase kebab-case identifier for a feature flag, such as `checkout-redesign`.

## Evaluation

The deterministic process that returns whether a flag is enabled for a supplied context and why that decision was made.

## Context

Caller-provided attributes used for rule matching and rollout bucketing. Context is untrusted input and must be validated before domain behavior uses it.

## Rule

A simple condition that checks a context attribute using a supported operator such as `equals` or `in`.

## Percentage rollout

An optional rollout configuration that uses an integer percentage from `0` through `100` and a context attribute for deterministic bucketing.

## Rollout bucket

The stable bucket produced from the flag key and normalized context value. The same flag key and context value should produce the same rollout decision.

## Audit event

An append-only record of a successful flag mutation with action, event ID, timestamp, flag key, and before/after snapshots.

## Repository

A storage abstraction for domain state. The current repositories are in memory; accepted future persistence is PostgreSQL.

## Capability spec

An OpenSpec behavior specification that defines required system behavior and validation scenarios.
