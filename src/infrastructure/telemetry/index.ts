import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  type SpanExporter,
} from "@opentelemetry/sdk-trace-base";
import type { Span } from "@opentelemetry/api";
import { IncomingMessage } from "node:http";
import type { TelemetryConfig } from "./config.js";
import { SafeSpanExporter } from "./safe-span-exporter.js";

export type TelemetryHandle = {
  enabled: boolean;
  shutdown: () => Promise<void>;
};

export type StartTelemetryOptions = {
  spanExporter?: SpanExporter;
};

export function startTelemetry(
  config: TelemetryConfig,
  options: StartTelemetryOptions = {},
): TelemetryHandle {
  if (!config.enabled) {
    return {
      enabled: false,
      shutdown: async () => {},
    };
  }

  const exporter = options.spanExporter ?? createSpanExporter(config.exporter);
  const sdk = new NodeSDK({
    serviceName: config.serviceName,
    instrumentations: [
      createHttpInstrumentation(),
      createExpressInstrumentation(),
    ],
    spanProcessors: [new SimpleSpanProcessor(new SafeSpanExporter(exporter))],
  });

  sdk.start();

  return {
    enabled: true,
    shutdown: () => sdk.shutdown(),
  };
}

function createSpanExporter(exporter: "console"): SpanExporter;
function createSpanExporter(exporter: string): SpanExporter {
  if (exporter === "console") {
    return new ConsoleSpanExporter();
  }

  throw new Error("Unsupported telemetry exporter");
}

function createHttpInstrumentation(): HttpInstrumentation {
  return new HttpInstrumentation({
    disableOutgoingRequestInstrumentation: true,
    headersToSpanAttributes: {
      server: {
        requestHeaders: [],
        responseHeaders: [],
      },
    },
    applyCustomAttributesOnSpan: (span, request, response) => {
      if (isIncomingMessage(request)) {
        setSafeHttpRoute(span, request);
      }

      if ("statusCode" in response && typeof response.statusCode === "number") {
        span.setAttribute("http.response.status_code", response.statusCode);
      }
    },
  });
}

function createExpressInstrumentation(): ExpressInstrumentation {
  return new ExpressInstrumentation({
    requestHook: (span, info) => {
      span.setAttribute("http.route", safeRoute(info.route));
    },
    spanNameHook: (info) => `${info.request.method} ${safeRoute(info.route)}`,
  });
}

function setSafeHttpRoute(span: Span, request: IncomingMessage): void {
  span.setAttribute("http.request.method", request.method ?? "UNKNOWN");
  span.setAttribute("http.route", safeRoute(getExpressRoutePath(request)));
}

function getExpressRoutePath(request: IncomingMessage): unknown {
  const expressRequest = request as IncomingMessage & {
    route?: {
      path?: unknown;
    };
  };

  return expressRequest.route?.path;
}

function safeRoute(route: unknown): string {
  if (typeof route === "string" && route.length > 0) {
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

function isIncomingMessage(value: unknown): value is IncomingMessage {
  return value instanceof IncomingMessage;
}
