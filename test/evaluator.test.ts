import { describe, expect, it } from "vitest";
import { evaluateFlag } from "../src/domain/evaluator.js";
import type { FeatureFlag } from "../src/domain/types.js";

describe("evaluateFlag", () => {
  it("returns true for enabled flags without rules", () => {
    const flag = makeFlag({ enabled: true });

    expect(evaluateFlag(flag, {})).toEqual({
      key: "new-dashboard",
      enabled: true,
      reason: "enabled",
    });
  });

  it("returns false for disabled flags", () => {
    const flag = makeFlag({ enabled: false });

    expect(evaluateFlag(flag, {})).toEqual({
      key: "new-dashboard",
      enabled: false,
      reason: "disabled",
    });
  });

  it("matches equals rules", () => {
    const flag = makeFlag({
      rules: [{ attribute: "plan", operator: "equals", value: "pro" }],
    });

    expect(evaluateFlag(flag, { plan: "pro" })).toEqual({
      key: "new-dashboard",
      enabled: true,
      reason: "matched_rule",
    });
  });

  it("does not match equals rules when the context value differs", () => {
    const flag = makeFlag({
      rules: [{ attribute: "plan", operator: "equals", value: "pro" }],
    });

    expect(evaluateFlag(flag, { plan: "free" })).toEqual({
      key: "new-dashboard",
      enabled: false,
      reason: "no_matching_rule",
    });
  });

  it("matches in rules", () => {
    const flag = makeFlag({
      rules: [{ attribute: "country", operator: "in", values: ["BR", "US"] }],
    });

    expect(evaluateFlag(flag, { country: "BR" })).toEqual({
      key: "new-dashboard",
      enabled: true,
      reason: "matched_rule",
    });
  });

  it("does not match in rules when the context value is absent from the list", () => {
    const flag = makeFlag({
      rules: [{ attribute: "country", operator: "in", values: ["BR", "US"] }],
    });

    expect(evaluateFlag(flag, { country: "DE" })).toEqual({
      key: "new-dashboard",
      enabled: false,
      reason: "no_matching_rule",
    });
  });
});

function makeFlag(overrides: Partial<FeatureFlag>): FeatureFlag {
  return {
    key: "new-dashboard",
    enabled: true,
    rules: [],
    ...overrides,
  };
}
