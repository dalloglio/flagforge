import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDatabaseConfig, type DatabaseConfig } from "./config.js";
import {
  createPostgresPool,
  describeDatabaseStartupError,
  type PostgresPool,
} from "./pool.js";

const migrationsDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

const migrationTableSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

export type MigrationResult = {
  applied: string[];
  skipped: string[];
};

export class MigrationChecksumError extends Error {
  constructor(filename: string) {
    super(`Applied migration '${filename}' has a different checksum on disk`);
  }
}

export async function runMigrations(
  pool: PostgresPool,
): Promise<MigrationResult> {
  await pool.query(migrationTableSql);

  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const filename of files) {
    const sql = await readFile(
      path.join(migrationsDirectory, filename),
      "utf8",
    );
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await pool.query<{ checksum: string }>(
      "select checksum from schema_migrations where filename = $1",
      [filename],
    );

    if (existing.rowCount) {
      if (existing.rows[0]?.checksum !== checksum) {
        throw new MigrationChecksumError(filename);
      }

      skipped.push(filename);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into schema_migrations (filename, checksum) values ($1, $2)",
        [filename, checksum],
      );
      await client.query("commit");
      applied.push(filename);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  return { applied, skipped };
}

export async function runMigrationsForConfig(
  config: DatabaseConfig,
): Promise<MigrationResult> {
  const pool = createPostgresPool(config);
  try {
    return await runMigrations(pool);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrationsForConfig(parseDatabaseConfig())
    .then((result) => {
      console.log(
        `PostgreSQL migrations complete: ${result.applied.length} applied, ${result.skipped.length} skipped`,
      );
    })
    .catch((error: unknown) => {
      console.error(describeDatabaseStartupError(error));
      process.exitCode = 1;
    });
}
