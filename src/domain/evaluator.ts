import type {
  EvaluationContext,
  EvaluationReason,
  EvaluationResult,
  FeatureFlag,
  FlagRule,
  RolloutConfig,
} from "./types.js";

export function evaluateFlag(
  flag: FeatureFlag,
  context: EvaluationContext,
): EvaluationResult {
  if (!flag.enabled) {
    return {
      key: flag.key,
      enabled: false,
      reason: "disabled",
    };
  }

  const eligibleReason = getEligibilityReason(flag, context);

  if (!eligibleReason) {
    return {
      key: flag.key,
      enabled: false,
      reason: "no_matching_rule",
    };
  }

  if (flag.rollout) {
    return evaluateRollout(flag.key, flag.rollout, context);
  }

  return {
    key: flag.key,
    enabled: true,
    reason: eligibleReason,
  };
}

function getEligibilityReason(
  flag: FeatureFlag,
  context: EvaluationContext,
): Extract<EvaluationReason, "enabled" | "matched_rule"> | undefined {
  if (flag.rules.length === 0) {
    return "enabled";
  }

  return flag.rules.some((rule) => ruleMatches(rule, context))
    ? "matched_rule"
    : undefined;
}

function ruleMatches(rule: FlagRule, context: EvaluationContext): boolean {
  const actualValue = context[rule.attribute];

  if (actualValue === undefined) {
    return false;
  }

  if (rule.operator === "equals") {
    return Object.is(actualValue, rule.value);
  }

  return rule.values.some((value) => Object.is(value, actualValue));
}

function evaluateRollout(
  key: string,
  rollout: RolloutConfig,
  context: EvaluationContext,
): EvaluationResult {
  const contextValue = context[rollout.attribute];

  if (contextValue === undefined) {
    return {
      key,
      enabled: false,
      reason: "missing_rollout_attribute",
    };
  }

  const bucket = rolloutBucket(key, contextValue);
  const included = bucket < rollout.percentage;

  return {
    key,
    enabled: included,
    reason: included ? "in_rollout" : "not_in_rollout",
  };
}

function rolloutBucket(key: string, contextValue: string | number | boolean) {
  const input = `${key}:${normalizeRolloutValue(contextValue)}`;
  let hash = 0;

  for (const character of input) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % 100;
}

function normalizeRolloutValue(value: string | number | boolean) {
  return `${typeof value}:${String(value)}`;
}
