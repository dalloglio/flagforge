import "./local-env.js";

import { parseTelemetryConfig } from "./infrastructure/telemetry/config.js";
import {
  startTelemetry,
  type TelemetryHandle,
} from "./infrastructure/telemetry/index.js";
import { describeRuntimeStartupError } from "./runtime-startup.js";

async function main() {
  const telemetry = startTelemetry(parseTelemetryConfig());

  try {
    await startServer(telemetry);
  } catch (error) {
    await telemetry.shutdown();
    throw error;
  }
}

async function startServer(telemetry: TelemetryHandle) {
  const { parseAdminAuthConfig } = await import("./api/admin-auth.js");
  const { parseAdminRateLimitConfig } =
    await import("./api/admin-rate-limit.js");
  const { createApp } = await import("./api/app.js");
  const { parseDatabaseConfig } =
    await import("./infrastructure/postgres/config.js");
  const { createPostgresUseCases } =
    await import("./infrastructure/postgres/dependencies.js");
  const { createPostgresReadinessCheck } =
    await import("./infrastructure/postgres/readiness.js");
  const { assertPostgresAvailable, createPostgresPool } =
    await import("./infrastructure/postgres/pool.js");

  const port = Number(process.env.PORT ?? 3000);
  const adminAuth = parseAdminAuthConfig();
  const adminRateLimit = parseAdminRateLimitConfig();
  const config = parseDatabaseConfig();
  const pool = createPostgresPool(config);

  await assertPostgresAvailable(pool);

  const app = createApp({
    adminAuth,
    adminRateLimit,
    useCases: createPostgresUseCases(pool),
    readinessCheck: createPostgresReadinessCheck(pool),
  });

  const server = app.listen(port, () => {
    console.log(`FlagForge API listening on port ${port}`);
    console.log("PostgreSQL persistence initialized");
  });

  server.on("close", () => {
    void pool.end();
    void telemetry.shutdown();
  });
}

main().catch((error: unknown) => {
  console.error(describeRuntimeStartupError(error));
  process.exitCode = 1;
});
