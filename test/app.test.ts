import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/api/app.js";
import { InMemoryAuditLogRepository } from "../src/domain/audit-log.js";
import { InMemoryFlagRepository } from "../src/domain/repository.js";

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createTestApp();
});

describe("FlagForge API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns liveness status without checking readiness", async () => {
    const response = await request(app).get("/healthz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns ready status when readiness succeeds", async () => {
    const response = await request(app).get("/readyz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ready",
      dependencies: {
        postgresql: {
          status: "available",
        },
      },
    });
  });

  it("returns not ready status when readiness fails", async () => {
    app = createTestApp({
      readinessCheck: async () => {
        throw new Error("database unavailable");
      },
    });

    const response = await request(app).get("/readyz");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "not_ready",
      dependencies: {
        postgresql: {
          status: "unavailable",
        },
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("database unavailable");
  });

  it("creates, lists, and reads a flag", async () => {
    const createResponse = await request(app).post("/flags").send({
      key: "checkout-redesign",
      enabled: true,
      description: "Roll out the new checkout",
      rules: [],
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      key: "checkout-redesign",
      enabled: true,
      description: "Roll out the new checkout",
      rules: [],
    });

    const listResponse = await request(app).get("/flags");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual([createResponse.body]);

    const readResponse = await request(app).get("/flags/checkout-redesign");
    expect(readResponse.status).toBe(200);
    expect(readResponse.body).toEqual(createResponse.body);
  });

  it("creates a flag with rollout configuration", async () => {
    const response = await request(app)
      .post("/flags")
      .send({
        key: "checkout-redesign",
        enabled: true,
        rules: [],
        rollout: { percentage: 25, attribute: "userId" },
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      key: "checkout-redesign",
      enabled: true,
      rules: [],
      rollout: { percentage: 25, attribute: "userId" },
    });
  });

  it("updates a flag without allowing key changes", async () => {
    await createFlag("checkout-redesign");

    const response = await request(app)
      .patch("/flags/checkout-redesign")
      .send({
        enabled: false,
        description: "Paused rollout",
        rules: [{ attribute: "plan", operator: "equals", value: "pro" }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      key: "checkout-redesign",
      enabled: false,
      description: "Paused rollout",
      rules: [{ attribute: "plan", operator: "equals", value: "pro" }],
    });

    const keyChangeResponse = await request(app)
      .patch("/flags/checkout-redesign")
      .send({
        key: "other-flag",
        enabled: true,
      });

    expect(keyChangeResponse.status).toBe(400);
    expect(keyChangeResponse.body.error.code).toBe("validation_error");
  });

  it("updates a flag with rollout configuration", async () => {
    await createFlag("checkout-redesign");

    const response = await request(app)
      .patch("/flags/checkout-redesign")
      .send({
        rollout: { percentage: 50, attribute: "accountId" },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      key: "checkout-redesign",
      enabled: true,
      rules: [],
      rollout: { percentage: 50, attribute: "accountId" },
    });
  });

  it("evaluates an existing flag", async () => {
    await request(app)
      .post("/flags")
      .send({
        key: "checkout-redesign",
        enabled: true,
        rules: [{ attribute: "country", operator: "in", values: ["BR", "US"] }],
      });

    const response = await request(app)
      .post("/flags/checkout-redesign/evaluate")
      .send({
        context: { country: "BR" },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      key: "checkout-redesign",
      enabled: true,
      reason: "matched_rule",
    });
  });

  it("rejects invalid create payloads", async () => {
    const response = await request(app).post("/flags").send({
      key: "",
      enabled: "yes",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("validation_error");
    expect(response.body.error.message).toBe("Invalid feature flag payload");
  });

  it("rejects invalid rollout create payloads", async () => {
    const response = await request(app)
      .post("/flags")
      .send({
        key: "checkout-redesign",
        enabled: true,
        rules: [],
        rollout: { percentage: 101, attribute: "" },
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("validation_error");
    expect(response.body.error.message).toBe("Invalid feature flag payload");
  });

  it("rejects duplicate keys", async () => {
    await createFlag("checkout-redesign");
    const response = await createFlag("checkout-redesign");

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("conflict");
  });

  it("returns not found for missing read, update, and evaluation requests", async () => {
    const readResponse = await request(app).get("/flags/missing");
    expect(readResponse.status).toBe(404);
    expect(readResponse.body.error.code).toBe("not_found");

    const updateResponse = await request(app)
      .patch("/flags/missing")
      .send({ enabled: false });
    expect(updateResponse.status).toBe(404);
    expect(updateResponse.body.error.code).toBe("not_found");

    const evaluateResponse = await request(app)
      .post("/flags/missing/evaluate")
      .send({ context: {} });
    expect(evaluateResponse.status).toBe(404);
    expect(evaluateResponse.body.error.code).toBe("not_found");
  });

  it("rejects invalid update and evaluation payloads", async () => {
    await createFlag("checkout-redesign");

    const updateResponse = await request(app)
      .patch("/flags/checkout-redesign")
      .send({});
    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.error.code).toBe("validation_error");

    const evaluateResponse = await request(app)
      .post("/flags/checkout-redesign/evaluate")
      .send({
        context: { plan: null },
      });
    expect(evaluateResponse.status).toBe(400);
    expect(evaluateResponse.body.error.code).toBe("validation_error");
  });

  it("rejects invalid rollout update payloads", async () => {
    await createFlag("checkout-redesign");

    const response = await request(app)
      .patch("/flags/checkout-redesign")
      .send({
        rollout: { percentage: 10.5, attribute: "userId" },
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("validation_error");
    expect(response.body.error.message).toBe(
      "Invalid feature flag update payload",
    );
  });

  it("lists an empty audit log", async () => {
    const response = await request(app).get("/audit-log");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("records audit events for successful create and update requests", async () => {
    useDeterministicAuditApp();

    const createResponse = await request(app)
      .post("/flags")
      .send({
        key: "checkout-redesign",
        enabled: true,
        rules: [{ attribute: "plan", operator: "equals", value: "pro" }],
      });
    expect(createResponse.status).toBe(201);

    const updateResponse = await request(app)
      .patch("/flags/checkout-redesign")
      .send({
        enabled: false,
        description: "Paused rollout",
      });
    expect(updateResponse.status).toBe(200);

    const response = await request(app).get("/audit-log");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: "event-1",
        occurredAt: "2026-05-30T17:00:00.000Z",
        action: "flag_created",
        flagKey: "checkout-redesign",
        before: null,
        after: createResponse.body,
      },
      {
        id: "event-2",
        occurredAt: "2026-05-30T17:01:00.000Z",
        action: "flag_updated",
        flagKey: "checkout-redesign",
        before: createResponse.body,
        after: updateResponse.body,
      },
    ]);
  });

  it("does not record audit events for invalid, duplicate, or not-found mutations", async () => {
    useDeterministicAuditApp();

    const invalidCreateResponse = await request(app).post("/flags").send({
      key: "",
      enabled: true,
      rules: [],
    });
    expect(invalidCreateResponse.status).toBe(400);

    await createFlag("checkout-redesign");

    const duplicateResponse = await createFlag("checkout-redesign");
    expect(duplicateResponse.status).toBe(409);

    const invalidUpdateResponse = await request(app)
      .patch("/flags/checkout-redesign")
      .send({});
    expect(invalidUpdateResponse.status).toBe(400);

    const notFoundUpdateResponse = await request(app)
      .patch("/flags/missing")
      .send({ enabled: false });
    expect(notFoundUpdateResponse.status).toBe(404);

    const response = await request(app).get("/audit-log");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: "event-1",
      action: "flag_created",
      flagKey: "checkout-redesign",
    });
  });

  it("filters audit events by flag key", async () => {
    useDeterministicAuditApp();

    await createFlag("checkout-redesign");
    await createFlag("pricing-page");

    const response = await request(app).get(
      "/audit-log?flagKey=checkout-redesign",
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      action: "flag_created",
      flagKey: "checkout-redesign",
    });
  });

  it("rejects invalid audit log filters", async () => {
    const response = await request(app).get("/audit-log?flagKey=");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("validation_error");
    expect(response.body.error.message).toBe("Invalid audit log filter");
  });

  it("exposes Prometheus metrics with runtime and HTTP request observations", async () => {
    await request(app).get("/healthz");
    await request(app).get("/flags/checkout-redesign?include=secret");
    await request(app).post("/flags").send({
      key: "checkout-redesign",
      enabled: true,
      rules: [],
    });

    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.headers["content-type"]).toContain("version=0.0.4");
    expect(response.text).toContain("process_cpu_user_seconds_total");
    expect(response.text).toContain("# HELP http_requests_total");
    expect(response.text).toContain(
      'http_requests_total{method="GET",route="/healthz",status="200"}',
    );
    expect(response.text).toContain(
      'http_requests_total{method="GET",route="/flags/:key",status="404"}',
    );
    expect(response.text).toContain(
      'http_requests_total{method="POST",route="/flags",status="201"}',
    );
    expect(response.text).toContain(
      'http_request_duration_seconds_count{method="GET",route="/healthz",status="200"}',
    );
    expect(response.text).not.toContain("checkout-redesign");
    expect(response.text).not.toContain("include=secret");
  });

  it("isolates metrics between app instances", async () => {
    await request(app).get("/healthz");

    const firstMetricsResponse = await request(app).get("/metrics");
    expect(firstMetricsResponse.text).toContain(
      'http_requests_total{method="GET",route="/healthz",status="200"}',
    );

    const secondApp = createTestApp();
    const secondMetricsResponse = await request(secondApp).get("/metrics");

    expect(secondMetricsResponse.text).not.toContain(
      'route="/healthz",status="200"',
    );
  });

  it("counts malformed JSON responses without exposing request body content", async () => {
    const secretBody = '{"key":"checkout-redesign","apiKey":"super-secret"';

    const malformedResponse = await request(app)
      .post("/flags")
      .set("content-type", "application/json")
      .send(secretBody);

    expect(malformedResponse.status).toBe(400);

    const metricsResponse = await request(app).get("/metrics");

    expect(metricsResponse.text).toContain(
      'http_requests_total{method="POST",route="unmatched",status="400"}',
    );
    expect(metricsResponse.text).toContain(
      'http_request_duration_seconds_count{method="POST",route="unmatched",status="400"}',
    );
    expect(metricsResponse.text).not.toContain("checkout-redesign");
    expect(metricsResponse.text).not.toContain("super-secret");
    expect(metricsResponse.text).not.toContain("apiKey");
  });
});

function createFlag(key: string) {
  return request(app).post("/flags").send({
    key,
    enabled: true,
    rules: [],
  });
}

function useDeterministicAuditApp() {
  const ids = ["event-1", "event-2", "event-3"];
  const timestamps = [
    "2026-05-30T17:00:00.000Z",
    "2026-05-30T17:01:00.000Z",
    "2026-05-30T17:02:00.000Z",
  ];

  app = createApp({
    flags: new InMemoryFlagRepository(),
    auditLog: new InMemoryAuditLogRepository(),
    eventIdGenerator: () => ids.shift() ?? "event-extra",
    clock: () => timestamps.shift() ?? "2026-05-30T17:59:00.000Z",
  });
}

function createTestApp(
  overrides: Partial<Parameters<typeof createApp>[0]> = {},
) {
  return createApp({
    flags: new InMemoryFlagRepository(),
    auditLog: new InMemoryAuditLogRepository(),
    readinessCheck: async () => {},
    ...overrides,
  });
}
