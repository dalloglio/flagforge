import { randomUUID } from "node:crypto";
import {
  InMemoryAuditLogRepository,
  type AuditLogRepository,
  createFlagCreatedAuditEvent,
  createFlagUpdatedAuditEvent,
} from "../domain/audit-log.js";
import { evaluateFlag } from "../domain/evaluator.js";
import {
  InMemoryFlagRepository,
  type FlagRepository,
} from "../domain/repository.js";
import type {
  CreateFlagInput,
  EvaluationContext,
  EvaluationResult,
  FeatureFlag,
  UpdateFlagInput,
} from "../domain/types.js";

export type EventIdGenerator = () => string;
export type Clock = () => string;

export type ApplicationRepositories = {
  flags: FlagRepository;
  auditLog: AuditLogRepository;
};

export type TransactionRunner = <T>(
  operation: (repositories: ApplicationRepositories) => Promise<T>,
) => Promise<T>;

export type FlagUseCases = {
  createFlag(input: CreateFlagInput): Promise<FeatureFlag>;
  listFlags(): Promise<FeatureFlag[]>;
  getFlag(key: string): Promise<FeatureFlag | undefined>;
  updateFlag(
    key: string,
    input: UpdateFlagInput,
  ): Promise<FeatureFlag | undefined>;
  evaluateFlag(
    key: string,
    context: EvaluationContext,
  ): Promise<EvaluationResult | undefined>;
  listAuditEvents(filter?: {
    flagKey?: string | undefined;
  }): ReturnType<AuditLogRepository["list"]>;
};

export type FlagUseCaseDependencies = ApplicationRepositories & {
  transaction?: TransactionRunner | undefined;
  eventIdGenerator?: EventIdGenerator | undefined;
  clock?: Clock | undefined;
};

export function createFlagUseCases(
  dependencies: FlagUseCaseDependencies,
): FlagUseCases {
  const eventIdGenerator = dependencies.eventIdGenerator ?? randomUUID;
  const clock = dependencies.clock ?? (() => new Date().toISOString());

  return {
    async createFlag(input) {
      return runMutation(dependencies, async ({ flags, auditLog }) => {
        const created = await flags.create(input);
        await auditLog.append(
          createFlagCreatedAuditEvent(createAuditEventMetadata(), created),
        );
        return created;
      });
    },

    listFlags() {
      return dependencies.flags.list();
    },

    getFlag(key) {
      return dependencies.flags.get(key);
    },

    async updateFlag(key, input) {
      return runMutation(dependencies, async ({ flags, auditLog }) => {
        const before = await (flags.getForUpdate?.(key) ?? flags.get(key));
        if (!before) {
          return undefined;
        }

        const updated = await flags.update(key, input);
        if (!updated) {
          throw new Error("Expected feature flag to exist after locked read");
        }

        await auditLog.append(
          createFlagUpdatedAuditEvent(
            createAuditEventMetadata(),
            before,
            updated,
          ),
        );

        return updated;
      });
    },

    async evaluateFlag(key, context) {
      const flag = await dependencies.flags.get(key);
      return flag ? evaluateFlag(flag, context) : undefined;
    },

    listAuditEvents(filter) {
      return dependencies.auditLog.list(filter);
    },
  };

  function createAuditEventMetadata() {
    return {
      id: eventIdGenerator(),
      occurredAt: clock(),
    };
  }
}

function runMutation<T>(
  dependencies: FlagUseCaseDependencies,
  operation: (repositories: ApplicationRepositories) => Promise<T>,
): Promise<T> {
  if (dependencies.transaction) {
    return dependencies.transaction(operation);
  }

  return operation(dependencies);
}

export type InMemoryUseCaseOverrides = {
  flags?: FlagRepository | undefined;
  auditLog?: AuditLogRepository | undefined;
  eventIdGenerator?: EventIdGenerator | undefined;
  clock?: Clock | undefined;
  transaction?: TransactionRunner | undefined;
};

export function createInMemoryUseCaseDependencies(
  overrides: InMemoryUseCaseOverrides = {},
): FlagUseCaseDependencies {
  return {
    flags: overrides.flags ?? new InMemoryFlagRepository(),
    auditLog: overrides.auditLog ?? new InMemoryAuditLogRepository(),
    eventIdGenerator: overrides.eventIdGenerator,
    clock: overrides.clock,
    transaction: overrides.transaction,
  };
}
