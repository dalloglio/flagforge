import { AdminAuthConfigError } from "./api/admin-auth.js";
import { AdminRateLimitConfigError } from "./api/admin-rate-limit.js";
import { DatabaseConfigError } from "./infrastructure/postgres/config.js";
import { PostgresDependencyError } from "./infrastructure/postgres/pool.js";
import { TelemetryConfigError } from "./infrastructure/telemetry/config.js";

export function describeRuntimeStartupError(error: unknown): string {
  if (error instanceof AdminAuthConfigError) {
    return error.message;
  }

  if (error instanceof AdminRateLimitConfigError) {
    return error.message;
  }

  if (error instanceof DatabaseConfigError) {
    return error.message;
  }

  if (error instanceof PostgresDependencyError) {
    return error.message;
  }

  if (error instanceof TelemetryConfigError) {
    return error.message;
  }

  return "FlagForge API failed to start";
}
