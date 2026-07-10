import { InMemorySpanExporter } from "@opentelemetry/sdk-trace-base";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import {
  startTelemetry,
  type TelemetryHandle,
} from "../src/infrastructure/telemetry/index.js";
import { filterSpanAttributes } from "../src/infrastructure/telemetry/safe-span-exporter.js";

let telemetry: TelemetryHandle | undefined;

afterEach(async () => {
  await telemetry?.shutdown();
  telemetry = undefined;
});

describe("OpenTelemetry runtime instrumentation", () => {
  it("does not initialize exporters when disabled", async () => {
    const exporter = new InMemorySpanExporter();

    telemetry = startTelemetry(
      { enabled: false, serviceName: "flagforge-api" },
      { spanExporter: exporter },
    );

    expect(telemetry.enabled).toBe(false);
    await telemetry.shutdown();
    expect(exporter.getFinishedSpans()).toEqual([]);
  });

  it("exports safe HTTP span attributes for served API requests", async () => {
    const exporter = new InMemorySpanExporter();

    telemetry = startTelemetry(
      {
        enabled: true,
        exporter: "console",
        serviceName: "flagforge-api",
      },
      { spanExporter: exporter },
    );

    const { createApp } = await import("../src/api/app.js");
    const app = createApp();

    const response = await request(app)
      .post(
        "/flags/checkout-redesign/evaluate?apiKey=super-secret&include=full",
      )
      .set("X-Admin-API-Key", "dev-admin-api-key")
      .send({
        context: {
          userId: "user-123",
          plan: "enterprise",
          apiKey: "body-secret",
        },
      });

    expect(response.status).toBe(404);

    const serializedSpans = JSON.stringify(
      exporter.getFinishedSpans().map((span) => ({
        name: span.name,
        attributes: span.attributes,
      })),
    );

    expect(serializedSpans).toContain("http.route");
    expect(serializedSpans).toContain("/flags/:key/evaluate");
    expect(serializedSpans).toContain("http.request.method");
    expect(serializedSpans).toContain("http.response.status_code");
    expect(serializedSpans).not.toContain("checkout-redesign");
    expect(serializedSpans).not.toContain("apiKey=super-secret");
    expect(serializedSpans).not.toContain("include=full");
    expect(serializedSpans).not.toContain("user-123");
    expect(serializedSpans).not.toContain("enterprise");
    expect(serializedSpans).not.toContain("body-secret");
    expect(serializedSpans).not.toContain("dev-admin-api-key");
  });

  it("filters unsafe default instrumentation attributes before export", () => {
    expect(
      filterSpanAttributes({
        "http.request.method": "GET",
        "http.response.status_code": 200,
        "http.route": "/flags/:key",
        "url.full": "http://localhost/flags/checkout-redesign?apiKey=secret",
        "server.address": "localhost",
        "http.request.header.x-admin-api-key": "secret",
        "db.connection_string": "postgres://flagforge:secret@localhost/db",
        "feature.context.userId": "user-123",
      }),
    ).toEqual({
      "http.request.method": "GET",
      "http.response.status_code": 200,
      "http.route": "/flags/:key",
    });
  });
});
