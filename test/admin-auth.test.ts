import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  createAdminAuthGuard,
  parseAdminAuthConfig,
} from "../src/api/admin-auth.js";
import { createApp } from "../src/api/app.js";

describe("admin API authentication configuration", () => {
  it("parses the configured ADMIN_API_KEY", () => {
    expect(
      parseAdminAuthConfig({ ADMIN_API_KEY: "dev-admin-api-key" }),
    ).toEqual({
      apiKey: "dev-admin-api-key",
    });
  });

  it("fails clearly when ADMIN_API_KEY is missing", () => {
    expect(() => parseAdminAuthConfig({})).toThrow(
      "ADMIN_API_KEY is required for admin API authentication",
    );
  });

  it("allows tests to construct the API with explicit admin auth config", async () => {
    const app = createApp({
      adminAuth: { apiKey: "explicit-test-admin-key" },
    });

    const response = await request(app)
      .get("/flags")
      .set("X-Admin-API-Key", "explicit-test-admin-key");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("admin API authentication guard", () => {
  it("returns the same generic response for missing and invalid credentials", async () => {
    const app = createApp({
      adminAuth: { apiKey: "dev-admin-api-key" },
    });

    const missingResponse = await request(app).get("/flags");
    const invalidResponse = await request(app)
      .get("/flags")
      .set("X-Admin-API-Key", "wrong-admin-api-key");

    expect(missingResponse.status).toBe(401);
    expect(invalidResponse.status).toBe(401);
    expect(invalidResponse.body).toEqual(missingResponse.body);
  });

  it("is independent from domain dependencies", () => {
    const guard = createAdminAuthGuard({ apiKey: "dev-admin-api-key" });

    expect(guard).toEqual(expect.any(Function));
  });
});
