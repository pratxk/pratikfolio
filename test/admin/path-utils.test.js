import { describe, it, expect } from "vitest";
import { getPath, setPath } from "@/components/admin/path-utils.js";

describe("path-utils", () => {
  it("gets nested values", () => {
    expect(getPath({ a: { b: [1, 2] } }, ["a", "b", 1])).toBe(2);
    expect(getPath({ a: {} }, ["a", "x", "y"])).toBeUndefined();
  });
  it("sets nested values immutably", () => {
    const src = { a: { b: 1 }, c: 2 };
    const out = setPath(src, ["a", "b"], 9);
    expect(out.a.b).toBe(9);
    expect(src.a.b).toBe(1); // original untouched
    expect(out.c).toBe(2);
  });
  it("sets into arrays immutably", () => {
    const src = { list: [{ n: 1 }, { n: 2 }] };
    const out = setPath(src, ["list", 0, "n"], 5);
    expect(out.list[0].n).toBe(5);
    expect(src.list[0].n).toBe(1);
  });
});
