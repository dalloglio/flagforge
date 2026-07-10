export type TelemetryExporter = "console";

export type TelemetryConfig =
  | {
      enabled: false;
      serviceName: string;
    }
  | {
      enabled: true;
      exporter: TelemetryExporter;
      serviceName: string;
    };

export class TelemetryConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const defaultServiceName = "flagforge-api";

export function parseTelemetryConfig(
  env: NodeJS.ProcessEnv = process.env,
): TelemetryConfig {
  const serviceName = env.OTEL_SERVICE_NAME || defaultServiceName;
  const enabled = parseOptionalBoolean(
    env.FLAGFORGE_OTEL_ENABLED,
    "FLAGFORGE_OTEL_ENABLED",
  );

  if (!enabled) {
    return {
      enabled: false,
      serviceName,
    };
  }

  const exporter = env.FLAGFORGE_OTEL_EXPORTER;
  if (!exporter) {
    throw new TelemetryConfigError(
      "FLAGFORGE_OTEL_EXPORTER is required when FLAGFORGE_OTEL_ENABLED is true",
    );
  }

  if (exporter !== "console") {
    throw new TelemetryConfigError(
      "FLAGFORGE_OTEL_EXPORTER must be 'console' for local OpenTelemetry validation",
    );
  }

  return {
    enabled: true,
    exporter,
    serviceName,
  };
}

function parseOptionalBoolean(
  value: string | undefined,
  variableName: string,
): boolean {
  if (value === undefined || value === "") {
    return false;
  }

  if (["true", "1"].includes(value.toLowerCase())) {
    return true;
  }

  if (["false", "0"].includes(value.toLowerCase())) {
    return false;
  }

  throw new TelemetryConfigError(`${variableName} must be true or false`);
}
