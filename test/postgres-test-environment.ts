import { config as loadDotenv } from "dotenv";
import {
  DatabaseConfigError,
  parseDatabaseConfig,
} from "../src/infrastructure/postgres/config.js";

export function loadPostgresTestEnvironment(): void {
  loadDotenv({ path: ".env" });
}

export function parsePostgresTestDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
) {
  if (!env.TEST_DATABASE_URL) {
    throw new DatabaseConfigError(
      "TEST_DATABASE_URL is required for PostgreSQL integration tests",
    );
  }

  return parseDatabaseConfig(env, "TEST_DATABASE_URL");
}
