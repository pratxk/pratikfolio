import { describe, it, expect } from "vitest";
import { configSchema } from "@/lib/config-schema.js";
import realConfig from "/CONFIG.json";

describe("configSchema", () => {
  it("accepts the current CONFIG.json", () => {
    expect(() => configSchema.parse(realConfig)).not.toThrow();
  });
  it("rejects a config missing cards", () => {
    const bad = { ...realConfig };
    delete bad.cards;
    expect(() => configSchema.parse(bad)).toThrow();
  });
  it("rejects cards that is not an array", () => {
    expect(() => configSchema.parse({ ...realConfig, cards: {} })).toThrow();
  });
});
