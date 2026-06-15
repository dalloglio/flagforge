import type { Response } from "express";
import { ZodError } from "zod";

export type ErrorCode =
  | "validation_error"
  | "unauthorized"
  | "conflict"
  | "not_found"
  | "bad_request"
  | "internal_error";

export function sendError(
  response: Response,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
): void {
  response.status(status).json({
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  });
}

export function zodDetails(error: ZodError): unknown {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
