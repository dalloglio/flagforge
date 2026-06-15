import { AdminAuthConfigError } from "./api/admin-auth.js";
import { DatabaseConfigError } from "./infrastructure/postgres/config.js";
import { PostgresDependencyError } from "./infrastructure/postgres/pool.js";

export function describeRuntimeStartupError(error: unknown): string {
  if (error instanceof AdminAuthConfigError) {
    return error.message;
  }

  if (error instanceof DatabaseConfigError) {
    return error.message;
  }

  if (error instanceof PostgresDependencyError) {
    return error.message;
  }

  return "FlagForge API failed to start";
}
