import { describe, it, expect, beforeAll } from "vitest";
beforeAll(() => {
  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "123";
  process.env.CLOUDINARY_API_SECRET = "secret";
});
describe("signUpload", () => {
  it("returns deterministic signature params", async () => {
    const { signUpload } = await import("@/lib/cloudinary.js");
    const a = signUpload({ timestamp: 1000, folder: "portfolio" });
    const b = signUpload({ timestamp: 1000, folder: "portfolio" });
    expect(a.signature).toBe(b.signature);
    expect(a.apiKey).toBe("123");
    expect(a.cloudName).toBe("demo");
  });
});
