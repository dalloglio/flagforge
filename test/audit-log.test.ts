import { describe, expect, it } from "vitest";
import {
  InMemoryAuditLogRepository,
  createFlagCreatedAuditEvent,
  createFlagUpdatedAuditEvent,
  type AuditEvent,
} from "../src/domain/audit-log.js";
import type { FeatureFlag } from "../src/domain/types.js";

describe("AuditLogRepository", () => {
  it("appends and lists events from oldest to newest", async () => {
    const repository = new InMemoryAuditLogRepository();
    const created = makeEvent({
      id: "event-1",
      action: "flag_created",
      flagKey: "checkout-redesign",
    });
    const updated = makeEvent({
      id: "event-2",
      action: "flag_updated",
      flagKey: "checkout-redesign",
    });

    await repository.append(created);
    await repository.append(updated);

    await expect(repository.list()).resolves.toEqual([created, updated]);
  });

  it("filters events by flag key", async () => {
    const repository = new InMemoryAuditLogRepository();
    const checkoutEvent = makeEvent({
      id: "event-1",
      flagKey: "checkout-redesign",
    });
    const pricingEvent = makeEvent({
      id: "event-2",
      flagKey: "pricing-page",
    });

    await repository.append(checkoutEvent);
    await repository.append(pricingEvent);

    await expect(
      repository.list({ flagKey: "checkout-redesign" }),
    ).resolves.toEqual([checkoutEvent]);
  });

  it("returns cloned event snapshots", async () => {
    const repository = new InMemoryAuditLogRepository();
    const event = makeEvent({
      action: "flag_updated",
      before: makeFlag({ enabled: true }),
      after: makeFlag({ enabled: false }),
    });
    const expected = makeEvent({
      action: "flag_updated",
      before: makeFlag({ enabled: true }),
      after: makeFlag({ enabled: false }),
    });

    const appended = await repository.append(event);
    appended.after.rules.push({
      attribute: "plan",
      operator: "in",
      values: ["pro"],
    });
    event.after.enabled = true;
    const listed = await repository.list();
    listed[0]?.after.rules.push({
      attribute: "country",
      operator: "equals",
      value: "BR",
    });

    await expect(repository.list()).resolves.toEqual([expected]);
  });

  it("creates audit events with deterministic metadata", () => {
    const before = makeFlag({ enabled: true });
    const after = makeFlag({ enabled: false });

    expect(
      createFlagCreatedAuditEvent(
        { id: "event-1", occurredAt: "2026-05-30T17:00:00.000Z" },
        before,
      ),
    ).toEqual({
      id: "event-1",
      occurredAt: "2026-05-30T17:00:00.000Z",
      action: "flag_created",
      flagKey: "checkout-redesign",
      before: null,
      after: before,
    });

    expect(
      createFlagUpdatedAuditEvent(
        { id: "event-2", occurredAt: "2026-05-30T17:01:00.000Z" },
        before,
        after,
      ),
    ).toEqual({
      id: "event-2",
      occurredAt: "2026-05-30T17:01:00.000Z",
      action: "flag_updated",
      flagKey: "checkout-redesign",
      before,
      after,
    });
  });
});

function makeEvent(overrides: Partial<AuditEvent>): AuditEvent {
  const after = overrides.after ?? makeFlag({});

  return {
    id: "event-1",
    occurredAt: "2026-05-30T17:00:00.000Z",
    action: "flag_created",
    flagKey: after.key,
    before: null,
    after,
    ...overrides,
  };
}

function makeFlag(overrides: Partial<FeatureFlag>): FeatureFlag {
  return {
    key: "checkout-redesign",
    enabled: true,
    rules: [],
    ...overrides,
  };
}
