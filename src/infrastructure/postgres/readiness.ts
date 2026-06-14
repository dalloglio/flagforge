import type { ReadinessCheck } from "../../api/operational.js";
import { assertPostgresAvailable } from "./pool.js";
import type { PostgresPool } from "./pool.js";

export function createPostgresReadinessCheck(
  pool: PostgresPool,
): ReadinessCheck {
  return async () => {
    await assertPostgresAvailable(pool);
  };
}
