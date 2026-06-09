import type { FeatureFlag } from "./types.js";
import { cloneFlag } from "./repository.js";

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

export interface AuditLogRepository {
  append(event: AuditEvent): Promise<AuditEvent>;
  list(filter?: { flagKey?: string | undefined }): Promise<AuditEvent[]>;
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
  private readonly events: AuditEvent[] = [];

  async append(event: AuditEvent): Promise<AuditEvent> {
    const snapshot = cloneAuditEvent(event);
    this.events.push(snapshot);
    return cloneAuditEvent(snapshot);
  }

  async list(filter?: { flagKey?: string | undefined }): Promise<AuditEvent[]> {
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
