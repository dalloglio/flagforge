import { describe, expect, it } from "vitest";
import {
  parseTelemetryConfig,
  TelemetryConfigError,
} from "../src/infrastructure/telemetry/config.js";
import { describeRuntimeStartupError } from "../src/runtime-startup.js";

describe("OpenTelemetry configuration", () => {
  it("is disabled by default", () => {
    expect(parseTelemetryConfig({})).toEqual({
      enabled: false,
      serviceName: "flagforge-api",
    });
  });

  it("can be disabled explicitly", () => {
    expect(
      parseTelemetryConfig({
        FLAGFORGE_OTEL_ENABLED: "false",
        FLAGFORGE_OTEL_EXPORTER: "console",
        OTEL_SERVICE_NAME: "custom-flagforge-api",
      }),
    ).toEqual({
      enabled: false,
      serviceName: "custom-flagforge-api",
    });
  });

  it("parses enabled local console export configuration", () => {
    expect(
      parseTelemetryConfig({
        FLAGFORGE_OTEL_ENABLED: "true",
        FLAGFORGE_OTEL_EXPORTER: "console",
      }),
    ).toEqual({
      enabled: true,
      exporter: "console",
      serviceName: "flagforge-api",
    });
  });

  it("rejects incomplete enabled export configuration", () => {
    expect(() =>
      parseTelemetryConfig({ FLAGFORGE_OTEL_ENABLED: "true" }),
    ).toThrow(
      "FLAGFORGE_OTEL_EXPORTER is required when FLAGFORGE_OTEL_ENABLED is true",
    );
  });

  it("rejects unsupported exporters and invalid enablement values", () => {
    expect(() =>
      parseTelemetryConfig({
        FLAGFORGE_OTEL_ENABLED: "true",
        FLAGFORGE_OTEL_EXPORTER: "otlp",
      }),
    ).toThrow(
      "FLAGFORGE_OTEL_EXPORTER must be 'console' for local OpenTelemetry validation",
    );

    expect(() =>
      parseTelemetryConfig({ FLAGFORGE_OTEL_ENABLED: "sometimes" }),
    ).toThrow("FLAGFORGE_OTEL_ENABLED must be true or false");
  });

  it("preserves telemetry configuration diagnostics at startup", () => {
    expect(
      describeRuntimeStartupError(
        new TelemetryConfigError(
          "FLAGFORGE_OTEL_ENABLED must be true or false",
        ),
      ),
    ).toBe("FLAGFORGE_OTEL_ENABLED must be true or false");
  });
});
