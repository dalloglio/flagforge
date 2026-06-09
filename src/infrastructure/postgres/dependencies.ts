import {
  type ApplicationRepositories,
  createFlagUseCases,
  type FlagUseCases,
} from "../../application/flag-use-cases.js";
import {
  PostgresAuditLogRepository,
  PostgresFlagRepository,
} from "./repositories.js";
import type { PostgresPool } from "./pool.js";

export function createPostgresUseCases(pool: PostgresPool): FlagUseCases {
  return createFlagUseCases({
    flags: new PostgresFlagRepository(pool),
    auditLog: new PostgresAuditLogRepository(pool),
    transaction: async (operation) => {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const repositories: ApplicationRepositories = {
          flags: new PostgresFlagRepository(client),
          auditLog: new PostgresAuditLogRepository(client),
        };
        const result = await operation(repositories);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
  });
}
