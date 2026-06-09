import { describe, expect, it } from "vitest";
import { parseDatabaseConfig } from "../src/infrastructure/postgres/config.js";

describe("PostgreSQL configuration", () => {
  it("fails clearly when the database URL is missing", () => {
    expect(() => parseDatabaseConfig({}, "DATABASE_URL")).toThrow(
      "DATABASE_URL is required for PostgreSQL persistence",
    );
  });

  it("fails clearly when the database URL is invalid", () => {
    expect(() =>
      parseDatabaseConfig({ DATABASE_URL: "not a url" }, "DATABASE_URL"),
    ).toThrow("DATABASE_URL must be a valid PostgreSQL connection URL");
  });

  it("redacts passwords from parsed diagnostics", () => {
    const config = parseDatabaseConfig(
      {
        DATABASE_URL:
          "postgres://flagforge:super-secret@localhost:5432/flagforge",
      },
      "DATABASE_URL",
    );

    expect(config.redactedConnectionString).toContain("REDACTED");
    expect(config.redactedConnectionString).not.toContain("super-secret");
  });
});
