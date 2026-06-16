import { describe, expect, it } from "vitest";
import {
  FixedWindowAdminRateLimiter,
  parseAdminRateLimitConfig,
} from "../src/api/admin-rate-limit.js";

describe("admin API rate-limit configuration", () => {
  it("uses the documented local default policy", () => {
    expect(parseAdminRateLimitConfig({})).toEqual({
      maxRequests: 60,
      windowMs: 60_000,
    });
  });

  it("parses valid request and window overrides", () => {
    expect(
      parseAdminRateLimitConfig({
        ADMIN_RATE_LIMIT_REQUESTS: "5",
        ADMIN_RATE_LIMIT_WINDOW_MS: "1000",
      }),
    ).toEqual({
      maxRequests: 5,
      windowMs: 1000,
    });
  });

  it("fails clearly for invalid overrides", () => {
    expect(() =>
      parseAdminRateLimitConfig({ ADMIN_RATE_LIMIT_REQUESTS: "0" }),
    ).toThrow("ADMIN_RATE_LIMIT_REQUESTS must be a positive integer");

    expect(() =>
      parseAdminRateLimitConfig({ ADMIN_RATE_LIMIT_WINDOW_MS: "1.5" }),
    ).toThrow("ADMIN_RATE_LIMIT_WINDOW_MS must be a positive integer");
  });
});

describe("fixed-window admin API rate limiter", () => {
  it("allows requests up to the configured limit", () => {
    const limiter = new FixedWindowAdminRateLimiter(
      { maxRequests: 2, windowMs: 1000 },
      () => 100,
    );

    expect(limiter.check("admin")).toEqual({
      allowed: true,
      remaining: 1,
      resetAt: 1100,
    });
    expect(limiter.check("admin")).toEqual({
      allowed: true,
      remaining: 0,
      resetAt: 1100,
    });
  });

  it("denies over-limit requests with deterministic retry guidance", () => {
    let now = 100;
    const limiter = new FixedWindowAdminRateLimiter(
      { maxRequests: 1, windowMs: 1500 },
      () => now,
    );

    expect(limiter.check("admin").allowed).toBe(true);

    now = 600;
    expect(limiter.check("admin")).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
      resetAt: 1600,
    });
  });

  it("recovers after the configured window resets", () => {
    let now = 100;
    const limiter = new FixedWindowAdminRateLimiter(
      { maxRequests: 1, windowMs: 1000 },
      () => now,
    );

    expect(limiter.check("admin").allowed).toBe(true);
    expect(limiter.check("admin").allowed).toBe(false);

    now = 1100;
    expect(limiter.check("admin")).toEqual({
      allowed: true,
      remaining: 0,
      resetAt: 2100,
    });
  });

  it("keeps accounting isolated by authenticated identity", () => {
    const limiter = new FixedWindowAdminRateLimiter(
      { maxRequests: 1, windowMs: 1000 },
      () => 100,
    );

    expect(limiter.check("admin-a").allowed).toBe(true);
    expect(limiter.check("admin-a").allowed).toBe(false);
    expect(limiter.check("admin-b").allowed).toBe(true);
  });
});
