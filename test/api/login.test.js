import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mem;
beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  process.env.MONGODB_DB = "pratikfolio_test";
  process.env.AUTH_SECRET = "test-secret-value-123456789";
  const { _resetForTest } = await import("@/lib/db.js");
  _resetForTest();
  const { getDb } = await import("@/lib/db.js");
  const { hashPassword } = await import("@/lib/auth.js");
  const db = await getDb();
  await db.collection("admins").insertOne({
    email: "me@x.io",
    passwordHash: await hashPassword("pw123456"),
  });
});
afterAll(async () => {
  if (mem) await mem.stop();
});

function reqOf(body) {
  return new Request("http://x/api/admin/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/admin/login", () => {
  it("rejects bad password", async () => {
    const { POST } = await import("@/app/api/admin/login/route.js");
    const res = await POST(reqOf({ email: "me@x.io", password: "nope" }));
    expect(res.status).toBe(401);
  });
  it("accepts good creds and sets cookie", async () => {
    const { POST } = await import("@/app/api/admin/login/route.js");
    const res = await POST(reqOf({ email: "me@x.io", password: "pw123456" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("admin_session=");
  });
});
