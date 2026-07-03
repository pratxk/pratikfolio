import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit.js";

describe("rateLimit", () => {
  it("allows up to max then blocks in-window", () => {
    const k = "k-" + Math.random();
    expect(rateLimit(k, 2, 10000)).toBe(true);
    expect(rateLimit(k, 2, 10000)).toBe(true);
    expect(rateLimit(k, 2, 10000)).toBe(false);
  });
});
