import { describe, expect, it } from "vitest";
import { AdminAuthConfigError } from "../src/api/admin-auth.js";
import { AdminRateLimitConfigError } from "../src/api/admin-rate-limit.js";
import { DatabaseConfigError } from "../src/infrastructure/postgres/config.js";
import { PostgresDependencyError } from "../src/infrastructure/postgres/pool.js";
import { describeRuntimeStartupError } from "../src/runtime-startup.js";

describe("runtime startup errors", () => {
  it("preserves missing admin API key diagnostics", () => {
    const message = describeRuntimeStartupError(
      new AdminAuthConfigError(
        "ADMIN_API_KEY is required for admin API authentication",
      ),
    );

    expect(message).toBe(
      "ADMIN_API_KEY is required for admin API authentication",
    );
    expect(message).not.toContain(
      "PostgreSQL persistence failed to initialize",
    );
  });

  it("preserves admin rate-limit configuration diagnostics", () => {
    expect(
      describeRuntimeStartupError(
        new AdminRateLimitConfigError(
          "ADMIN_RATE_LIMIT_REQUESTS must be a positive integer",
        ),
      ),
    ).toBe("ADMIN_RATE_LIMIT_REQUESTS must be a positive integer");
  });

  it("preserves database startup diagnostics", () => {
    expect(
      describeRuntimeStartupError(
        new DatabaseConfigError(
          "DATABASE_URL is required for PostgreSQL persistence",
        ),
      ),
    ).toBe("DATABASE_URL is required for PostgreSQL persistence");

    expect(
      describeRuntimeStartupError(
        new PostgresDependencyError("PostgreSQL dependency is unavailable"),
      ),
    ).toBe("PostgreSQL dependency is unavailable");
  });

  it("uses a neutral message for unexpected startup failures", () => {
    expect(describeRuntimeStartupError(new Error("unexpected"))).toBe(
      "FlagForge API failed to start",
    );
  });
});
