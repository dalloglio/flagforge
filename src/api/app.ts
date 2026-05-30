import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import { randomUUID } from "node:crypto";
import { evaluateFlag } from "../domain/evaluator.js";
import {
  createFlagSchema,
  evaluationRequestSchema,
  flagKeySchema,
  updateFlagSchema,
} from "../domain/schemas.js";
import {
  AuditLogRepository,
  createFlagCreatedAuditEvent,
  createFlagUpdatedAuditEvent,
} from "../domain/audit-log.js";
import { DuplicateFlagError, FlagRepository } from "../domain/repository.js";
import { sendError, zodDetails } from "./errors.js";

export type EventIdGenerator = () => string;
export type Clock = () => string;

export type AppDependencies = {
  repository?: FlagRepository;
  auditLogRepository?: AuditLogRepository;
  eventIdGenerator?: EventIdGenerator;
  clock?: Clock;
};

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const repository = dependencies.repository ?? new FlagRepository();
  const auditLogRepository =
    dependencies.auditLogRepository ?? new AuditLogRepository();
  const eventIdGenerator = dependencies.eventIdGenerator ?? randomUUID;
  const clock = dependencies.clock ?? (() => new Date().toISOString());

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.post("/flags", (request, response) => {
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
      const created = repository.create(parsed.data);
      auditLogRepository.append(
        createFlagCreatedAuditEvent(createAuditEventMetadata(), created),
      );
      return response.status(201).json(created);
    } catch (error) {
      if (error instanceof DuplicateFlagError) {
        return sendError(response, 409, "conflict", error.message);
      }

      throw error;
    }
  });

  app.get("/flags", (_request, response) => {
    response.status(200).json(repository.list());
  });

  app.get("/audit-log", (request, response) => {
    const rawFlagKey = request.query.flagKey;
    if (rawFlagKey === undefined) {
      return response.status(200).json(auditLogRepository.list());
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
      .json(auditLogRepository.list({ flagKey: parsed.data }));
  });

  app.get("/flags/:key", (request, response) => {
    const key = parseKey(request, response);
    if (!key) {
      return;
    }

    const flag = repository.get(key);
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

  app.patch("/flags/:key", (request, response) => {
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

    const before = repository.get(key);
    if (!before) {
      return sendError(
        response,
        404,
        "not_found",
        `Feature flag '${key}' was not found`,
      );
    }

    const updated = repository.update(key, parsed.data);
    if (!updated) {
      throw new Error("Expected feature flag to exist after pre-update read");
    }

    auditLogRepository.append(
      createFlagUpdatedAuditEvent(createAuditEventMetadata(), before, updated),
    );

    return response.status(200).json(updated);
  });

  app.post("/flags/:key/evaluate", (request, response) => {
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

    const flag = repository.get(key);
    if (!flag) {
      return sendError(
        response,
        404,
        "not_found",
        `Feature flag '${key}' was not found`,
      );
    }

    return response.status(200).json(evaluateFlag(flag, parsed.data.context));
  });

  app.use((_request, response) => {
    sendError(response, 404, "not_found", "Route was not found");
  });

  app.use(jsonErrorHandler);

  return app;

  function createAuditEventMetadata() {
    return {
      id: eventIdGenerator(),
      occurredAt: clock(),
    };
  }
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
