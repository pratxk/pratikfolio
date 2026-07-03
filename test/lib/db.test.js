import { describe, it, expect, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mem;
describe("getDb", () => {
  afterAll(async () => { if (mem) await mem.stop(); });
  it("returns a Db bound to MONGODB_DB and reuses the client", async () => {
    mem = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mem.getUri();
    process.env.MONGODB_DB = "pratikfolio_test";
    const { getDb, _resetForTest } = await import("@/lib/db.js");
    _resetForTest?.();
    const db1 = await getDb();
    const db2 = await getDb();
    expect(db1.databaseName).toBe("pratikfolio_test");
    expect(db1).toBe(db2);
  });
});
