import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";
import type { Request, RequestHandler, Response } from "express";

export type ReadinessCheck = () => Promise<void>;

export type LivenessResponse = {
  status: "ok";
};

export type ReadinessResponse = {
  status: "ready" | "not_ready";
  dependencies: {
    postgresql: {
      status: "available" | "unavailable";
    };
  };
};

export type OperationalMetrics = {
  registry: Registry;
  requestCount: Counter<"method" | "route" | "status">;
  requestDuration: Histogram<"method" | "route" | "status">;
};

export function createLivenessResponse(): LivenessResponse {
  return { status: "ok" };
}

export function createReadyResponse(): ReadinessResponse {
  return {
    status: "ready",
    dependencies: {
      postgresql: {
        status: "available",
      },
    },
  };
}

export function createNotReadyResponse(): ReadinessResponse {
  return {
    status: "not_ready",
    dependencies: {
      postgresql: {
        status: "unavailable",
      },
    },
  };
}

export function createOperationalMetrics(): OperationalMetrics {
  const registry = new Registry();

  collectDefaultMetrics({ register: registry });

  const requestCount = new Counter({
    name: "http_requests_total",
    help: "Total HTTP requests served by the API.",
    labelNames: ["method", "route", "status"],
    registers: [registry],
  });

  const requestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds.",
    labelNames: ["method", "route", "status"],
    registers: [registry],
  });

  return {
    registry,
    requestCount,
    requestDuration,
  };
}

export function createHttpMetricsMiddleware(
  metrics: OperationalMetrics,
): RequestHandler {
  return (request: Request, response: Response, next) => {
    const startedAt = process.hrtime.bigint();

    response.on("finish", () => {
      const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
      const labels = {
        method: request.method,
        route: getRouteLabel(request.route?.path),
        status: String(response.statusCode),
      };

      metrics.requestCount.inc(labels);
      metrics.requestDuration.observe(labels, durationSeconds);
    });

    next();
  };
}

function getRouteLabel(route: unknown): string {
  if (typeof route === "string") {
    return route;
  }

  if (
    Array.isArray(route) &&
    route.every((segment) => typeof segment === "string")
  ) {
    return route.join("|");
  }

  return "unmatched";
}
