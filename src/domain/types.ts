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

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description?: string | undefined;
  rules: FlagRule[];
};

export type CreateFlagInput = FeatureFlag;

export type UpdateFlagInput = {
  enabled?: boolean | undefined;
  description?: string | undefined;
  rules?: FlagRule[] | undefined;
};

export type EvaluationReason =
  | "enabled"
  | "disabled"
  | "matched_rule"
  | "no_matching_rule";

export type EvaluationResult = {
  key: string;
  enabled: boolean;
  reason: EvaluationReason;
};
