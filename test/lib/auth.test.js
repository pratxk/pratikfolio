import { describe, it, expect, beforeAll } from "vitest";
beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-value-123456789";
});

describe("auth", () => {
  it("hashes and verifies passwords", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth.js");
    const h = await hashPassword("s3cret");
    expect(await verifyPassword("s3cret", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
  it("signs and verifies a session, rejects tampered tokens", async () => {
    const { signSession, verifySession } = await import("@/lib/auth.js");
    const t = await signSession({ email: "a@b.c" });
    expect((await verifySession(t)).email).toBe("a@b.c");
    expect(await verifySession(t + "x")).toBeNull();
  });
});
