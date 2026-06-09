import pg from "pg";
import type {
  AuditEvent,
  AuditEventAction,
  AuditLogRepository,
} from "../../domain/audit-log.js";
import {
  DuplicateFlagError,
  cloneFlag,
  type FlagRepository,
} from "../../domain/repository.js";
import { createFlagSchema } from "../../domain/schemas.js";
import type {
  CreateFlagInput,
  FeatureFlag,
  UpdateFlagInput,
} from "../../domain/types.js";
import type { Queryable } from "./pool.js";

const duplicateKeyCode = "23505";

export class PostgresFlagRepository implements FlagRepository {
  constructor(private readonly database: Queryable) {}

  async create(input: CreateFlagInput): Promise<FeatureFlag> {
    try {
      const result = await this.database.query<FlagRow>(
        `
          insert into feature_flags (key, enabled, description, rules, rollout)
          values ($1, $2, $3, $4::jsonb, $5::jsonb)
          returning key, enabled, description, rules, rollout
        `,
        [
          input.key,
          input.enabled,
          input.description ?? null,
          JSON.stringify(input.rules),
          input.rollout ? JSON.stringify(input.rollout) : null,
        ],
      );

      return hydrateFlag(result.rows[0]);
    } catch (error) {
      if (isPgError(error) && error.code === duplicateKeyCode) {
        throw new DuplicateFlagError(input.key);
      }

      throw error;
    }
  }

  async list(): Promise<FeatureFlag[]> {
    const result = await this.database.query<FlagRow>(
      `
        select key, enabled, description, rules, rollout
        from feature_flags
        order by key asc
      `,
    );

    return result.rows.map(hydrateFlag);
  }

  async get(key: string): Promise<FeatureFlag | undefined> {
    return this.getWithQuery(key, "");
  }

  async getForUpdate(key: string): Promise<FeatureFlag | undefined> {
    return this.getWithQuery(key, "for update");
  }

  async update(
    key: string,
    input: UpdateFlagInput,
  ): Promise<FeatureFlag | undefined> {
    const existing = await this.get(key);
    if (!existing) {
      return undefined;
    }

    const updated: FeatureFlag = {
      key,
      enabled: input.enabled ?? existing.enabled,
      description: input.description ?? existing.description,
      rules: input.rules
        ? input.rules.map((rule) => ({ ...rule }))
        : existing.rules,
      rollout: input.rollout ?? existing.rollout,
    };

    const result = await this.database.query<FlagRow>(
      `
        update feature_flags
        set enabled = $2,
            description = $3,
            rules = $4::jsonb,
            rollout = $5::jsonb,
            updated_at = now()
        where key = $1
        returning key, enabled, description, rules, rollout
      `,
      [
        key,
        updated.enabled,
        updated.description ?? null,
        JSON.stringify(updated.rules),
        updated.rollout ? JSON.stringify(updated.rollout) : null,
      ],
    );

    return result.rows[0] ? hydrateFlag(result.rows[0]) : undefined;
  }

  private async getWithQuery(
    key: string,
    lockClause: string,
  ): Promise<FeatureFlag | undefined> {
    const result = await this.database.query<FlagRow>(
      `
        select key, enabled, description, rules, rollout
        from feature_flags
        where key = $1
        ${lockClause}
      `,
      [key],
    );

    return result.rows[0] ? hydrateFlag(result.rows[0]) : undefined;
  }
}

export class PostgresAuditLogRepository implements AuditLogRepository {
  constructor(private readonly database: Queryable) {}

  async append(event: AuditEvent): Promise<AuditEvent> {
    const result = await this.database.query<AuditEventRow>(
      `
        insert into audit_events (
          id,
          occurred_at,
          action,
          flag_key,
          before_snapshot,
          after_snapshot
        )
        values ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
        returning id, occurred_at, action, flag_key, before_snapshot, after_snapshot
      `,
      [
        event.id,
        event.occurredAt,
        event.action,
        event.flagKey,
        event.before ? JSON.stringify(event.before) : null,
        JSON.stringify(event.after),
      ],
    );

    return hydrateAuditEvent(result.rows[0]);
  }

  async list(filter?: { flagKey?: string | undefined }): Promise<AuditEvent[]> {
    const result =
      filter?.flagKey === undefined
        ? await this.database.query<AuditEventRow>(
            `
              select id, occurred_at, action, flag_key, before_snapshot, after_snapshot
              from audit_events
              order by sequence asc
            `,
          )
        : await this.database.query<AuditEventRow>(
            `
              select id, occurred_at, action, flag_key, before_snapshot, after_snapshot
              from audit_events
              where flag_key = $1
              order by sequence asc
            `,
            [filter.flagKey],
          );

    return result.rows.map(hydrateAuditEvent);
  }
}

type FlagRow = {
  key: string;
  enabled: boolean;
  description: string | null;
  rules: unknown;
  rollout: unknown | null;
};

type AuditEventRow = {
  id: string;
  occurred_at: Date;
  action: AuditEventAction;
  flag_key: string;
  before_snapshot: unknown | null;
  after_snapshot: unknown;
};

function hydrateFlag(row: FlagRow | undefined): FeatureFlag {
  if (!row) {
    throw new Error("Expected PostgreSQL feature flag row");
  }

  return createFlagSchema.parse({
    key: row.key,
    enabled: row.enabled,
    ...(row.description === null ? {} : { description: row.description }),
    rules: row.rules,
    ...(row.rollout === null ? {} : { rollout: row.rollout }),
  });
}

function hydrateAuditEvent(row: AuditEventRow | undefined): AuditEvent {
  if (!row) {
    throw new Error("Expected PostgreSQL audit event row");
  }

  const before =
    row.before_snapshot === null
      ? null
      : createFlagSchema.parse(row.before_snapshot);
  const after = createFlagSchema.parse(row.after_snapshot);

  return {
    id: row.id,
    occurredAt: row.occurred_at.toISOString(),
    action: row.action,
    flagKey: row.flag_key,
    before: before ? cloneFlag(before) : null,
    after: cloneFlag(after),
  };
}

function isPgError(error: unknown): error is pg.DatabaseError {
  return error instanceof Error && "code" in error;
}
