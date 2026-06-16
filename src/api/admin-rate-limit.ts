import type { NextFunction, Request, RequestHandler, Response } from "express";
import { sendError } from "./errors.js";

export const defaultAdminRateLimitRequests = 60;
export const defaultAdminRateLimitWindowMs = 60_000;

export type AdminRateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export type MillisecondClock = () => number;

export type AdminRateLimitDecision =
  | {
      allowed: true;
      remaining: number;
      resetAt: number;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
      resetAt: number;
    };

type WindowCounter = {
  count: number;
  resetAt: number;
};

export class AdminRateLimitConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class FixedWindowAdminRateLimiter {
  private readonly counters = new Map<string, WindowCounter>();

  constructor(
    private readonly config: AdminRateLimitConfig,
    private readonly clock: MillisecondClock = Date.now,
  ) {}

  check(identity: string): AdminRateLimitDecision {
    const now = this.clock();
    const counter = this.currentCounter(identity, now);

    if (counter.count >= this.config.maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((counter.resetAt - now) / 1000),
        ),
        resetAt: counter.resetAt,
      };
    }

    counter.count += 1;
    return {
      allowed: true,
      remaining: this.config.maxRequests - counter.count,
      resetAt: counter.resetAt,
    };
  }

  private currentCounter(identity: string, now: number): WindowCounter {
    const existing = this.counters.get(identity);
    if (existing && now < existing.resetAt) {
      return existing;
    }

    const next = {
      count: 0,
      resetAt: now + this.config.windowMs,
    };
    this.counters.set(identity, next);
    return next;
  }
}

export function parseAdminRateLimitConfig(
  env: NodeJS.ProcessEnv = process.env,
): AdminRateLimitConfig {
  const maxRequests = parsePositiveInteger(
    env.ADMIN_RATE_LIMIT_REQUESTS,
    "ADMIN_RATE_LIMIT_REQUESTS",
    defaultAdminRateLimitRequests,
  );
  const windowMs = parsePositiveInteger(
    env.ADMIN_RATE_LIMIT_WINDOW_MS,
    "ADMIN_RATE_LIMIT_WINDOW_MS",
    defaultAdminRateLimitWindowMs,
  );

  return { maxRequests, windowMs };
}

export function createAdminRateLimitMiddleware(
  limiter: FixedWindowAdminRateLimiter,
): RequestHandler {
  return (_request: Request, response: Response, next: NextFunction) => {
    const identity = response.locals.adminIdentity;
    if (typeof identity !== "string" || identity.length === 0) {
      return sendError(
        response,
        500,
        "internal_error",
        "Unexpected server error",
      );
    }

    const decision = limiter.check(identity);
    if (decision.allowed) {
      return next();
    }

    response.setHeader("Retry-After", String(decision.retryAfterSeconds));
    return sendError(
      response,
      429,
      "rate_limited",
      "Admin API rate limit exceeded",
    );
  };
}

function parsePositiveInteger(
  rawValue: string | undefined,
  variableName: string,
  defaultValue: number,
): number {
  if (rawValue === undefined || rawValue === "") {
    return defaultValue;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new AdminRateLimitConfigError(
      `${variableName} must be a positive integer`,
    );
  }

  const parsed = Number(rawValue);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new AdminRateLimitConfigError(
      `${variableName} must be a positive integer`,
    );
  }

  return parsed;
}
