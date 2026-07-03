import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
vi.mock("next/cache", () => ({
  unstable_cache: (fn) => fn,
  revalidateTag: vi.fn(),
}));

let mem;
beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  process.env.MONGODB_DB = "pratikfolio_test";
  const { _resetForTest } = await import("@/lib/db.js");
  _resetForTest();
});
afterAll(async () => {
  if (mem) await mem.stop();
});

describe("config API", () => {
  it("GET returns config, PUT saves, reorder works", async () => {
    const { GET, PUT } = await import("@/app/api/admin/config/route.js");
    const { PATCH } = await import("@/app/api/admin/config/reorder/route.js");
    const initial = (await (await GET()).json()).data;
    const next = { ...initial, cards: [{ title: "A" }, { title: "B" }] };
    const putRes = await PUT(
      new Request("http://x", { method: "PUT", body: JSON.stringify(next) }),
    );
    expect(putRes.status).toBe(200);
    const patchRes = await PATCH(
      new Request("http://x", {
        method: "PATCH",
        body: JSON.stringify({ path: ["cards"], order: [1, 0] }),
      }),
    );
    const data = (await patchRes.json()).data;
    expect(data.cards.map((c) => c.title)).toEqual(["B", "A"]);
  });
  it("PUT rejects invalid config", async () => {
    const { PUT } = await import("@/app/api/admin/config/route.js");
    const res = await PUT(
      new Request("http://x", { method: "PUT", body: JSON.stringify({ bad: 1 }) }),
    );
    expect(res.status).toBe(400);
  });
});
