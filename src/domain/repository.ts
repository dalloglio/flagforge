import type { CreateFlagInput, FeatureFlag, UpdateFlagInput } from "./types.js";

export class DuplicateFlagError extends Error {
  constructor(key: string) {
    super(`Feature flag '${key}' already exists`);
  }
}

export class FlagRepository {
  private readonly flags = new Map<string, FeatureFlag>();

  create(input: CreateFlagInput): FeatureFlag {
    if (this.flags.has(input.key)) {
      throw new DuplicateFlagError(input.key);
    }

    const flag = cloneFlag(input);
    this.flags.set(flag.key, flag);
    return cloneFlag(flag);
  }

  list(): FeatureFlag[] {
    return [...this.flags.values()].map(cloneFlag);
  }

  get(key: string): FeatureFlag | undefined {
    const flag = this.flags.get(key);
    return flag ? cloneFlag(flag) : undefined;
  }

  update(key: string, input: UpdateFlagInput): FeatureFlag | undefined {
    const existing = this.flags.get(key);
    if (!existing) {
      return undefined;
    }

    const updated: FeatureFlag = {
      key,
      enabled: input.enabled ?? existing.enabled,
      description: input.description ?? existing.description,
      rules: input.rules ? [...input.rules] : existing.rules,
    };

    this.flags.set(key, cloneFlag(updated));
    return cloneFlag(updated);
  }
}

function cloneFlag(flag: FeatureFlag): FeatureFlag {
  return {
    ...flag,
    rules: flag.rules.map((rule) => {
      if (rule.operator === "in") {
        return { ...rule, values: [...rule.values] };
      }

      return { ...rule };
    }),
  };
}
