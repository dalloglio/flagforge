## Context

FlagForge currently stores feature flags in memory and evaluates them with a pure domain function. A flag can be globally disabled, globally enabled, or enabled only when one of its context rules matches. The API exposes the stored flag shape directly through create, list, read, and update responses.

Percentage rollout should fit that model without adding persistence, segments, environments, SDK behavior, or external services. The key property is deterministic bucketing: the same flag and rollout identity should produce the same decision across repeated evaluations.

## Goals / Non-Goals

**Goals:**

- Add optional rollout configuration to feature flags.
- Support stable percentage rollout from `0` through `100`.
- Keep rollout evaluation deterministic and isolated in domain logic.
- Preserve existing behavior for flags without rollout configuration.
- Keep request validation explicit through Zod schemas.

**Non-Goals:**

- Multi-variant experiments or weighted variants.
- Segment management, environment scoping, or rule groups.
- Persistent storage or migration support.
- SDK-specific evaluation APIs.
- Cryptographic hashing guarantees.

## Decisions

### Represent rollout as optional flag configuration

Add an optional `rollout` object to the public flag shape:

```json
{
  "percentage": 25,
  "attribute": "userId"
}
```

`percentage` is an integer from `0` to `100`, inclusive. `attribute` identifies the context field used as the rollout identity.

Rationale: This keeps rollout separate from existing targeting rules. Existing `rules` continue to describe who is eligible, while `rollout` describes how much of that eligible population receives the flag.

Alternative considered: add a new rule operator such as `percentage`. That would mix targeting and rollout concerns inside the rule list and make rule ordering semantics more important than the current `some` matching model.

### Apply rollout after enabled-state and rule matching

Evaluation order:

1. If the flag is disabled, return disabled.
2. If the flag has rules and none match, return no matching rule.
3. If the flag has rollout configuration, apply deterministic percentage bucketing.
4. Otherwise return enabled or matched rule using the existing behavior.

Rationale: This treats rules as eligibility gates and rollout as the final exposure gate. A user outside targeting rules should not be considered for rollout.

Alternative considered: apply rollout before rules. That can exclude users before eligibility is known and makes the reason less useful when both rollout and rules are configured.

### Bucket from flag key and rollout context value

The evaluator will derive a stable bucket from the flag key and the selected context value, then map it into `0..99`. The flag is enabled when `bucket < percentage`.

Rationale: Including the flag key prevents the same user from always landing in the same bucket across every flag. Using caller-provided context keeps the evaluator stateless and preserves the current API model.

Alternative considered: use only the context value. That is simpler, but creates correlated rollout decisions across unrelated flags.

### Require the rollout attribute during evaluation

If a flag has rollout configuration but the evaluation context does not include the configured attribute, evaluation returns false with a rollout-specific reason.

Rationale: Falling back to a random or default identity would make results surprising and unstable. Returning false is conservative and explicit.

Alternative considered: treat missing rollout attributes as globally enabled. That would undermine rollout limits.

### Extend evaluation reasons

Add rollout-specific reasons to distinguish successful rollout, rollout exclusion, and missing rollout identity. Existing reasons remain valid for existing behavior.

Rationale: Clients and tests can understand why a flag evaluated false without adding debugging fields to the response body.

Alternative considered: keep only `enabled` and `no_matching_rule`. That hides rollout behavior behind unrelated reasons and makes diagnostics weaker.

## Risks / Trade-offs

- Hash distribution may be uneven for tiny populations -> Document deterministic behavior and test stable known examples, not statistical quality.
- Public flag shape changes -> Make `rollout` optional so existing clients and tests continue to work.
- Context values can be strings, numbers, or booleans -> Normalize values consistently before hashing.
- `0` and `100` percentages are edge cases -> Cover both directly in evaluator tests.
