import { describe, it, expect } from "vitest";
import { MockImageProvider } from "../providers/mock";
import {
  registerImageProvider,
  getImageProvider,
  listImageProviders,
  getDefaultImageProvider,
} from "../registry";

describe("MockImageProvider", () => {
  it("isAvailable returns true", async () => {
    const provider = new MockImageProvider();
    expect(await provider.isAvailable()).toBe(true);
  });

  it("generate returns result with id and metadata", async () => {
    const provider = new MockImageProvider();
    const result = await provider.generate({ prompt: "a red car" });

    expect(result.id).toBeTruthy();
    expect(result.id).toMatch(/^mock-/);
    expect(result.base64).toBeTruthy();
    expect(result.base64).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(result.metadata).toEqual({
      width: 1024,
      height: 1024,
      format: "svg+xml",
    });
  });

  it("generate uses custom dimensions", async () => {
    const provider = new MockImageProvider();
    const result = await provider.generate({
      prompt: "test",
      width: 512,
      height: 256,
    });

    expect(result.metadata.width).toBe(512);
    expect(result.metadata.height).toBe(256);
  });

  it("generate truncates long prompts in SVG", async () => {
    const provider = new MockImageProvider();
    const longPrompt = "word ".repeat(50);
    const result = await provider.generate({ prompt: longPrompt });

    // Should not throw, SVG should be valid
    expect(result.base64).toBeTruthy();
  });
});

describe("Image Provider Registry", () => {
  it("register, get, list, and getDefault work", () => {
    const provider = new MockImageProvider();
    registerImageProvider(provider);

    const found = getImageProvider("mock");
    expect(found).toBeDefined();
    expect(found!.name).toBe("mock");

    const all = listImageProviders();
    expect(all).toContain("mock");

    const defaultProvider = getDefaultImageProvider();
    expect(defaultProvider).toBeDefined();
    expect(defaultProvider!.name).toBe("mock");
  });

  it("getImageProvider returns undefined for unknown name", () => {
    expect(getImageProvider("nonexistent")).toBeUndefined();
  });
});
