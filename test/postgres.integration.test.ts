import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFlagUseCases } from "../src/application/flag-use-cases.js";
import { evaluateFlag } from "../src/domain/evaluator.js";
import { DuplicateFlagError } from "../src/domain/repository.js";
import type { FeatureFlag } from "../src/domain/types.js";
import { parseDatabaseConfig } from "../src/infrastructure/postgres/config.js";
import { createPostgresUseCases } from "../src/infrastructure/postgres/dependencies.js";
import {
  MigrationChecksumError,
  runMigrations,
} from "../src/infrastructure/postgres/migrate.js";
import {
  assertPostgresAvailable,
  createPostgresPool,
  type PostgresPool,
} from "../src/infrastructure/postgres/pool.js";
import {
  PostgresAuditLogRepository,
  PostgresFlagRepository,
} from "../src/infrastructure/postgres/repositories.js";

const { Pool } = pg;
const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const maybeDescribe = databaseUrl ? describe : describe.skip;

maybeDescribe("PostgreSQL persistence", () => {
  let pool: PostgresPool;

  beforeAll(async () => {
    const config = parseDatabaseConfig(
      { TEST_DATABASE_URL: databaseUrl },
      "TEST_DATABASE_URL",
    );
    pool = createPostgresPool(config);
    await assertPostgresAvailable(pool);
    await runMigrations(pool);
  });

  beforeEach(async () => {
    await pool.query(
      "truncate table audit_events, feature_flags restart identity",
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it("prepares an empty database from migrations", async () => {
    const tables = await pool.query<{ table_name: string }>(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name in ('schema_migrations', 'feature_flags', 'audit_events')
        order by table_name
      `,
    );

    expect(tables.rows.map((row) => row.table_name)).toEqual([
      "audit_events",
      "feature_flags",
      "schema_migrations",
    ]);
  });

  it("skips already-applied migrations with matching checksums", async () => {
    const result = await runMigrations(pool);

    expect(result.applied).toEqual([]);
    expect(result.skipped).toContain("001_initial_schema.sql");
  });

  it("fails when an applied migration checksum differs from disk", async () => {
    await pool.query(
      "update schema_migrations set checksum = 'wrong' where filename = $1",
      ["001_initial_schema.sql"],
    );

    try {
      await expect(runMigrations(pool)).rejects.toBeInstanceOf(
        MigrationChecksumError,
      );
    } finally {
      await pool.query("delete from schema_migrations where filename = $1", [
        "001_initial_schema.sql",
      ]);
      await runMigrations(pool);
    }
  });

  it("persists created and updated flags across repository lifecycles", async () => {
    const firstRepository = new PostgresFlagRepository(pool);
    await firstRepository.create(makeFlag({ key: "checkout-redesign" }));
    await firstRepository.update("checkout-redesign", {
      enabled: false,
      description: "Paused rollout",
    });

    const secondRepository = new PostgresFlagRepository(pool);

    await expect(secondRepository.get("checkout-redesign")).resolves.toEqual({
      key: "checkout-redesign",
      enabled: false,
      description: "Paused rollout",
      rules: [],
    });
  });

  it("hydrates persisted targeting rules and rollout for stable evaluation", async () => {
    const repository = new PostgresFlagRepository(pool);
    const flag = makeFlag({
      key: "new-dashboard",
      rules: [{ attribute: "plan", operator: "equals", value: "pro" }],
      rollout: { percentage: 50, attribute: "userId" },
    });
    await repository.create(flag);

    const before = evaluateFlag(flag, { plan: "pro", userId: "alice" });
    const persisted = await new PostgresFlagRepository(pool).get(
      "new-dashboard",
    );

    expect(persisted).toEqual(flag);
    expect(evaluateFlag(persisted!, { plan: "pro", userId: "alice" })).toEqual(
      before,
    );
  });

  it("persists audit events oldest-to-newest globally and by flag key", async () => {
    const auditLog = new PostgresAuditLogRepository(pool);
    await auditLog.append({
      id: "event-1",
      occurredAt: "2026-05-30T17:02:00.000Z",
      action: "flag_created",
      flagKey: "checkout-redesign",
      before: null,
      after: makeFlag({ key: "checkout-redesign" }),
    });
    await auditLog.append({
      id: "event-2",
      occurredAt: "2026-05-30T17:01:00.000Z",
      action: "flag_created",
      flagKey: "pricing-page",
      before: null,
      after: makeFlag({ key: "pricing-page" }),
    });

    const restartedAuditLog = new PostgresAuditLogRepository(pool);

    expect((await restartedAuditLog.list()).map((event) => event.id)).toEqual([
      "event-1",
      "event-2",
    ]);
    expect(
      (await restartedAuditLog.list({ flagKey: "checkout-redesign" })).map(
        (event) => event.id,
      ),
    ).toEqual(["event-1"]);
  });

  it("does not persist audit events for rejected mutations", async () => {
    const useCases = createPostgresUseCases(pool);
    await useCases.createFlag(makeFlag({ key: "checkout-redesign" }));

    await expect(
      useCases.createFlag(makeFlag({ key: "checkout-redesign" })),
    ).rejects.toBeInstanceOf(DuplicateFlagError);

    await expect(
      useCases.updateFlag("missing", { enabled: false }),
    ).resolves.toBeUndefined();

    const auditEvents = await useCases.listAuditEvents();
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]).toMatchObject({
      action: "flag_created",
      flagKey: "checkout-redesign",
    });
  });

  it("stores immutable audit snapshots after later updates", async () => {
    const ids = ["event-1", "event-2"];
    const useCases = createFlagUseCases({
      flags: new PostgresFlagRepository(pool),
      auditLog: new PostgresAuditLogRepository(pool),
      transaction: createTransactionRunner(pool),
      eventIdGenerator: () => ids.shift() ?? randomUUID(),
      clock: () => "2026-05-30T17:00:00.000Z",
    });

    await useCases.createFlag(makeFlag({ key: "checkout-redesign" }));
    await useCases.updateFlag("checkout-redesign", {
      enabled: false,
      description: "Paused rollout",
    });

    const auditEvents = await useCases.listAuditEvents();
    expect(auditEvents[0]?.after).toEqual(
      makeFlag({ key: "checkout-redesign" }),
    );
    expect(auditEvents[1]?.before).toEqual(
      makeFlag({ key: "checkout-redesign" }),
    );
    expect(auditEvents[1]?.after).toEqual({
      key: "checkout-redesign",
      enabled: false,
      description: "Paused rollout",
      rules: [],
    });
  });

  it("serializes concurrent updates with matching audit snapshots", async () => {
    const ids = ["event-1", "event-2", "event-3"];
    const useCases = createFlagUseCases({
      flags: new PostgresFlagRepository(pool),
      auditLog: new PostgresAuditLogRepository(pool),
      transaction: createTransactionRunner(pool),
      eventIdGenerator: () => ids.shift() ?? randomUUID(),
      clock: () => "2026-05-30T17:00:00.000Z",
    });

    await useCases.createFlag(makeFlag({ key: "checkout-redesign" }));
    await Promise.all([
      useCases.updateFlag("checkout-redesign", { description: "First update" }),
      useCases.updateFlag("checkout-redesign", { enabled: false }),
    ]);

    const events = await useCases.listAuditEvents({
      flagKey: "checkout-redesign",
    });
    const updateEvents = events.filter(
      (event) => event.action === "flag_updated",
    );

    expect(updateEvents).toHaveLength(2);
    expect(updateEvents[1]?.before).toEqual(updateEvents[0]?.after);
    expect(await useCases.getFlag("checkout-redesign")).toEqual(
      updateEvents[1]?.after,
    );
  });

  it("reports unavailable PostgreSQL without falling back to memory", async () => {
    const unavailablePool = new Pool({
      connectionString:
        "postgres://flagforge:flagforge@127.0.0.1:1/unavailable",
      connectionTimeoutMillis: 100,
    });

    await expect(assertPostgresAvailable(unavailablePool)).rejects.toThrow(
      "PostgreSQL dependency is unavailable",
    );
    await unavailablePool.end();
  });
});

function makeFlag(overrides: Partial<FeatureFlag>): FeatureFlag {
  return {
    key: "checkout-redesign",
    enabled: true,
    rules: [],
    ...overrides,
  };
}

function createTransactionRunner(pool: PostgresPool) {
  return async <T>(
    operation: (repositories: {
      flags: PostgresFlagRepository;
      auditLog: PostgresAuditLogRepository;
    }) => Promise<T>,
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query("begin");
      const result = await operation({
        flags: new PostgresFlagRepository(client),
        auditLog: new PostgresAuditLogRepository(client),
      });
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  };
}
