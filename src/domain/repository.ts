import type { CreateFlagInput, FeatureFlag, UpdateFlagInput } from "./types.js";

export class DuplicateFlagError extends Error {
  constructor(key: string) {
    super(`Feature flag '${key}' already exists`);
  }
}

export interface FlagRepository {
  create(input: CreateFlagInput): Promise<FeatureFlag>;
  list(): Promise<FeatureFlag[]>;
  get(key: string): Promise<FeatureFlag | undefined>;
  getForUpdate?(key: string): Promise<FeatureFlag | undefined>;
  update(key: string, input: UpdateFlagInput): Promise<FeatureFlag | undefined>;
}

export class InMemoryFlagRepository implements FlagRepository {
  private readonly flags = new Map<string, FeatureFlag>();

  async create(input: CreateFlagInput): Promise<FeatureFlag> {
    if (this.flags.has(input.key)) {
      throw new DuplicateFlagError(input.key);
    }

    const flag = cloneFlag(input);
    this.flags.set(flag.key, flag);
    return cloneFlag(flag);
  }

  async list(): Promise<FeatureFlag[]> {
    return [...this.flags.values()].map(cloneFlag);
  }

  async get(key: string): Promise<FeatureFlag | undefined> {
    const flag = this.flags.get(key);
    return flag ? cloneFlag(flag) : undefined;
  }

  async getForUpdate(key: string): Promise<FeatureFlag | undefined> {
    return this.get(key);
  }

  async update(
    key: string,
    input: UpdateFlagInput,
  ): Promise<FeatureFlag | undefined> {
    const existing = this.flags.get(key);
    if (!existing) {
      return undefined;
    }

    const updated: FeatureFlag = {
      key,
      enabled: input.enabled ?? existing.enabled,
      description: input.description ?? existing.description,
      rules: input.rules ? [...input.rules] : existing.rules,
      rollout: input.rollout ?? existing.rollout,
    };

    this.flags.set(key, cloneFlag(updated));
    return cloneFlag(updated);
  }
}

export function cloneFlag(flag: FeatureFlag): FeatureFlag {
  return {
    ...flag,
    rollout: flag.rollout ? { ...flag.rollout } : undefined,
    rules: flag.rules.map((rule) => {
      if (rule.operator === "in") {
        return { ...rule, values: [...rule.values] };
      }

      return { ...rule };
    }),
  };
}
