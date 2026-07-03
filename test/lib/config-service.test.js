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
afterAll(async () => { if (mem) await mem.stop(); });

describe("config-service", () => {
  it("falls back to CONFIG.json when singleton absent", async () => {
    const { readConfig } = await import("@/lib/config-service.js");
    const cfg = await readConfig();
    expect(cfg.cards).toBeInstanceOf(Array);
  });
  it("updateConfig persists and readConfig returns it", async () => {
    const { readConfig, updateConfig } = await import("@/lib/config-service.js");
    const cfg = await readConfig();
    const next = { ...cfg, siteMetadata: { ...cfg.siteMetadata, title: "New Title" } };
    await updateConfig(next);
    const back = await readConfig();
    expect(back.siteMetadata.title).toBe("New Title");
  });
  it("updateConfig rejects invalid config", async () => {
    const { updateConfig } = await import("@/lib/config-service.js");
    await expect(updateConfig({ nope: true })).rejects.toThrow();
  });
  it("reorderInConfig reorders a nested array", async () => {
    const { readConfig, updateConfig, reorderInConfig } = await import("@/lib/config-service.js");
    const cfg = await readConfig();
    const two = [{ title: "A" }, { title: "B" }];
    await updateConfig({ ...cfg, cards: two });
    await reorderInConfig(["cards"], [1, 0]);
    const back = await readConfig();
    expect(back.cards.map((c) => c.title)).toEqual(["B", "A"]);
  });
});
