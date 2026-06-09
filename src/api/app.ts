import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import {
  createFlagUseCases,
  createInMemoryUseCaseDependencies,
  type Clock,
  type EventIdGenerator,
  type FlagUseCases,
} from "../application/flag-use-cases.js";
import {
  createFlagSchema,
  evaluationRequestSchema,
  flagKeySchema,
  updateFlagSchema,
} from "../domain/schemas.js";
import type { AuditLogRepository } from "../domain/audit-log.js";
import {
  DuplicateFlagError,
  type FlagRepository,
} from "../domain/repository.js";
import { sendError, zodDetails } from "./errors.js";

export type AppDependencies = {
  useCases?: FlagUseCases;
  flags?: FlagRepository;
  auditLog?: AuditLogRepository;
  eventIdGenerator?: EventIdGenerator;
  clock?: Clock;
};

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const useCases =
    dependencies.useCases ??
    createFlagUseCases(
      createInMemoryUseCaseDependencies({
        flags: dependencies.flags,
        auditLog: dependencies.auditLog,
        eventIdGenerator: dependencies.eventIdGenerator,
        clock: dependencies.clock,
      }),
    );

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.post("/flags", async (request, response) => {
    const parsed = createFlagSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(
        response,
        400,
        "validation_error",
        "Invalid feature flag payload",
        zodDetails(parsed.error),
      );
    }

    try {
      const created = await useCases.createFlag(parsed.data);
      return response.status(201).json(created);
    } catch (error) {
      if (error instanceof DuplicateFlagError) {
        return sendError(response, 409, "conflict", error.message);
      }

      throw error;
    }
  });

  app.get("/flags", async (_request, response) => {
    response.status(200).json(await useCases.listFlags());
  });

  app.get("/audit-log", async (request, response) => {
    const rawFlagKey = request.query.flagKey;
    if (rawFlagKey === undefined) {
      return response.status(200).json(await useCases.listAuditEvents());
    }

    const parsed = flagKeySchema.safeParse(rawFlagKey);
    if (!parsed.success) {
      return sendError(
        response,
        400,
        "validation_error",
        "Invalid audit log filter",
        zodDetails(parsed.error),
      );
    }

    return response
      .status(200)
      .json(await useCases.listAuditEvents({ flagKey: parsed.data }));
  });

  app.get("/flags/:key", async (request, response) => {
    const key = parseKey(request, response);
    if (!key) {
      return;
    }

    const flag = await useCases.getFlag(key);
    if (!flag) {
      return sendError(
        response,
        404,
        "not_found",
        `Feature flag '${key}' was not found`,
      );
    }

    return response.status(200).json(flag);
  });

  app.patch("/flags/:key", async (request, response) => {
    const key = parseKey(request, response);
    if (!key) {
      return;
    }

    const parsed = updateFlagSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(
        response,
        400,
        "validation_error",
        "Invalid feature flag update payload",
        zodDetails(parsed.error),
      );
    }

    const updated = await useCases.updateFlag(key, parsed.data);
    if (!updated) {
      return sendError(
        response,
        404,
        "not_found",
        `Feature flag '${key}' was not found`,
      );
    }

    return response.status(200).json(updated);
  });

  app.post("/flags/:key/evaluate", async (request, response) => {
    const key = parseKey(request, response);
    if (!key) {
      return;
    }

    const parsed = evaluationRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(
        response,
        400,
        "validation_error",
        "Invalid evaluation payload",
        zodDetails(parsed.error),
      );
    }

    const result = await useCases.evaluateFlag(key, parsed.data.context);
    if (!result) {
      return sendError(
        response,
        404,
        "not_found",
        `Feature flag '${key}' was not found`,
      );
    }

    return response.status(200).json(result);
  });

  app.use((_request, response) => {
    sendError(response, 404, "not_found", "Route was not found");
  });

  app.use(jsonErrorHandler);

  return app;
}

function parseKey(request: Request, response: Response): string | undefined {
  const parsed = flagKeySchema.safeParse(request.params.key);
  if (!parsed.success) {
    sendError(
      response,
      400,
      "validation_error",
      "Invalid feature flag key",
      zodDetails(parsed.error),
    );
    return undefined;
  }

  return parsed.data;
}

const jsonErrorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && "body" in error) {
    return sendError(
      response,
      400,
      "bad_request",
      "Request body must be valid JSON",
    );
  }

  return sendError(response, 500, "internal_error", "Unexpected server error");
};
