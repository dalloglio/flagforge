import pg from "pg";
import { DatabaseConfigError, type DatabaseConfig } from "./config.js";

const { Pool } = pg;

export type Queryable = pg.Pool | pg.PoolClient;
export type PostgresPool = pg.Pool;

export class PostgresDependencyError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function createPostgresPool(config: DatabaseConfig): PostgresPool {
  return new Pool({
    connectionString: config.connectionString,
  });
}

export async function assertPostgresAvailable(
  pool: PostgresPool,
): Promise<void> {
  try {
    await pool.query("select 1");
  } catch (error) {
    throw new PostgresDependencyError(
      `PostgreSQL dependency is unavailable: ${errorMessage(error)}`,
    );
  }
}

export function describeDatabaseStartupError(error: unknown): string {
  if (error instanceof DatabaseConfigError) {
    return error.message;
  }

  if (error instanceof PostgresDependencyError) {
    return error.message;
  }

  return "PostgreSQL persistence failed to initialize";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown database error";
}
