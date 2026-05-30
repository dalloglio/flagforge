import type { FeatureFlag } from "./types.js";

export type AuditEventAction = "flag_created" | "flag_updated";

export type AuditEvent = {
  id: string;
  occurredAt: string;
  action: AuditEventAction;
  flagKey: string;
  before: FeatureFlag | null;
  after: FeatureFlag;
};

export type AuditEventMetadata = {
  id: string;
  occurredAt: string;
};

export class AuditLogRepository {
  private readonly events: AuditEvent[] = [];

  append(event: AuditEvent): AuditEvent {
    const snapshot = cloneAuditEvent(event);
    this.events.push(snapshot);
    return cloneAuditEvent(snapshot);
  }

  list(filter?: { flagKey?: string | undefined }): AuditEvent[] {
    const events =
      filter?.flagKey === undefined
        ? this.events
        : this.events.filter((event) => event.flagKey === filter.flagKey);

    return events.map(cloneAuditEvent);
  }
}

export function createFlagCreatedAuditEvent(
  metadata: AuditEventMetadata,
  flag: FeatureFlag,
): AuditEvent {
  return {
    ...metadata,
    action: "flag_created",
    flagKey: flag.key,
    before: null,
    after: cloneFlag(flag),
  };
}

export function createFlagUpdatedAuditEvent(
  metadata: AuditEventMetadata,
  before: FeatureFlag,
  after: FeatureFlag,
): AuditEvent {
  return {
    ...metadata,
    action: "flag_updated",
    flagKey: after.key,
    before: cloneFlag(before),
    after: cloneFlag(after),
  };
}

function cloneAuditEvent(event: AuditEvent): AuditEvent {
  return {
    ...event,
    before: event.before ? cloneFlag(event.before) : null,
    after: cloneFlag(event.after),
  };
}

function cloneFlag(flag: FeatureFlag): FeatureFlag {
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
