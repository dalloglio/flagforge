import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/api/app.js";

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp();
});

describe("FlagForge API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
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
});

function createFlag(key: string) {
  return request(app).post("/flags").send({
    key,
    enabled: true,
    rules: [],
  });
}
