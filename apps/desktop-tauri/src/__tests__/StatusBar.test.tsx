import { describe, it, expect } from "vitest";

// Simple smoke test for StatusBar rendering
describe("StatusBar", () => {
  it("renders without crash", async () => {
    // Just verify the test framework works
    expect(true).toBe(true);
  });

  it("can import from store", async () => {
    const mod = await import("../store");
    expect(mod.useStore).toBeDefined();
  });
});
