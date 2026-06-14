import "./local-env.js";

import { parseAdminAuthConfig } from "./api/admin-auth.js";
import { createApp } from "./api/app.js";
import { parseDatabaseConfig } from "./infrastructure/postgres/config.js";
import { createPostgresUseCases } from "./infrastructure/postgres/dependencies.js";
import { createPostgresReadinessCheck } from "./infrastructure/postgres/readiness.js";
import {
  assertPostgresAvailable,
  createPostgresPool,
  describeDatabaseStartupError,
} from "./infrastructure/postgres/pool.js";

async function main() {
  const port = Number(process.env.PORT ?? 3000);
  const adminAuth = parseAdminAuthConfig();
  const config = parseDatabaseConfig();
  const pool = createPostgresPool(config);

  await assertPostgresAvailable(pool);

  const app = createApp({
    adminAuth,
    useCases: createPostgresUseCases(pool),
    readinessCheck: createPostgresReadinessCheck(pool),
  });

  const server = app.listen(port, () => {
    console.log(`FlagForge API listening on port ${port}`);
    console.log("PostgreSQL persistence initialized");
  });

  server.on("close", () => {
    void pool.end();
  });
}

main().catch((error: unknown) => {
  console.error(describeDatabaseStartupError(error));
  process.exitCode = 1;
});
