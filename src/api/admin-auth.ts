import type { NextFunction, Request, RequestHandler, Response } from "express";
import { sendError } from "./errors.js";

export const adminApiKeyHeader = "X-Admin-API-Key";
export const authenticatedAdminIdentity = "configured-admin-api-key";

export type AdminAuthConfig = {
  apiKey: string;
};

export class AdminAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function parseAdminAuthConfig(
  env: NodeJS.ProcessEnv = process.env,
  variableName = "ADMIN_API_KEY",
): AdminAuthConfig {
  const apiKey = env[variableName];
  if (!apiKey) {
    throw new AdminAuthConfigError(
      `${variableName} is required for admin API authentication`,
    );
  }

  return { apiKey };
}

export function createAdminAuthGuard(config: AdminAuthConfig): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    const submittedKey = request.header(adminApiKeyHeader);
    if (submittedKey !== config.apiKey) {
      return sendAdminAuthError(response);
    }

    response.locals.adminIdentity = authenticatedAdminIdentity;
    return next();
  };
}

export function sendAdminAuthError(response: Response): void {
  sendError(response, 401, "unauthorized", "Valid admin API key is required");
}
