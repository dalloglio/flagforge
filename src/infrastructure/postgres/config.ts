export type DatabaseConfig = {
  connectionString: string;
  redactedConnectionString: string;
};

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function parseDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
  variableName = "DATABASE_URL",
): DatabaseConfig {
  const value = env[variableName];
  if (!value) {
    throw new DatabaseConfigError(
      `${variableName} is required for PostgreSQL persistence`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new DatabaseConfigError(
      `${variableName} must be a valid PostgreSQL connection URL`,
    );
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new DatabaseConfigError(
      `${variableName} must use the postgres:// or postgresql:// protocol`,
    );
  }

  const redacted = new URL(parsed);
  if (redacted.password) {
    redacted.password = "REDACTED";
  }

  return {
    connectionString: value,
    redactedConnectionString: redacted.toString(),
  };
}
