import type {
  EvaluationContext,
  EvaluationResult,
  FeatureFlag,
  FlagRule,
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

  if (flag.rules.length === 0) {
    return {
      key: flag.key,
      enabled: true,
      reason: "enabled",
    };
  }

  const matched = flag.rules.some((rule) => ruleMatches(rule, context));

  return {
    key: flag.key,
    enabled: matched,
    reason: matched ? "matched_rule" : "no_matching_rule",
  };
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
