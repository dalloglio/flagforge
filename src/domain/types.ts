export type ContextValue = string | number | boolean;

export type EvaluationContext = Record<string, ContextValue>;

export type EqualsRule = {
  attribute: string;
  operator: "equals";
  value: ContextValue;
};

export type InRule = {
  attribute: string;
  operator: "in";
  values: ContextValue[];
};

export type FlagRule = EqualsRule | InRule;

export type RolloutConfig = {
  percentage: number;
  attribute: string;
};

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description?: string | undefined;
  rules: FlagRule[];
  rollout?: RolloutConfig | undefined;
};

export type CreateFlagInput = FeatureFlag;

export type UpdateFlagInput = {
  enabled?: boolean | undefined;
  description?: string | undefined;
  rules?: FlagRule[] | undefined;
  rollout?: RolloutConfig | undefined;
};

export type EvaluationReason =
  | "enabled"
  | "disabled"
  | "matched_rule"
  | "no_matching_rule"
  | "in_rollout"
  | "not_in_rollout"
  | "missing_rollout_attribute";

export type EvaluationResult = {
  key: string;
  enabled: boolean;
  reason: EvaluationReason;
};
