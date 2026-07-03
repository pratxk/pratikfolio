import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-value-123456789";
});

describe("middleware", () => {
  it("redirects unauthenticated /admin to /admin/login", async () => {
    const { middleware } = await import("@/middleware.js");
    const res = await middleware(new NextRequest("http://x/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });
  it("allows /admin/login through", async () => {
    const { middleware } = await import("@/middleware.js");
    const res = await middleware(new NextRequest("http://x/admin/login"));
    expect(res.headers.get("location")).toBeNull();
  });
  it("401s unauthenticated /api/admin/config", async () => {
    const { middleware } = await import("@/middleware.js");
    const res = await middleware(new NextRequest("http://x/api/admin/config"));
    expect(res.status).toBe(401);
  });
});
