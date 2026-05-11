import { describe, it, expect } from "vitest";
import { AssetManager } from "../manager";

describe("AssetManager", () => {
  it("register returns asset with id and createdAt", async () => {
    const manager = new AssetManager();
    const asset = await manager.register({
      type: "image",
      source: "url",
      url: "https://example.com/photo.png",
      metadata: { width: 800, height: 600, format: "png" },
      tags: ["photo"],
    });

    expect(asset.id).toBeDefined();
    expect(typeof asset.id).toBe("string");
    expect(asset.id.length).toBeGreaterThan(0);
    expect(asset.createdAt).toBeDefined();
    expect(new Date(asset.createdAt).toISOString()).toBe(asset.createdAt);
    expect(asset.type).toBe("image");
    expect(asset.source).toBe("url");
    expect(asset.url).toBe("https://example.com/photo.png");
    expect(asset.tags).toEqual(["photo"]);
  });

  it("get retrieves registered asset", async () => {
    const manager = new AssetManager();
    const registered = await manager.register({
      type: "icon",
      source: "local",
      path: "/icons/star.svg",
      metadata: { format: "svg" },
      tags: ["star"],
    });

    const retrieved = await manager.get(registered.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(registered.id);
    expect(retrieved!.type).toBe("icon");
    expect(retrieved!.path).toBe("/icons/star.svg");
  });

  it("get returns undefined for unknown id", async () => {
    const manager = new AssetManager();
    const result = await manager.get("nonexistent");
    expect(result).toBeUndefined();
  });

  it("query filters by type and tags", async () => {
    const manager = new AssetManager();

    await manager.register({
      type: "image",
      source: "url",
      url: "https://example.com/1.png",
      metadata: {},
      tags: ["landscape", "nature"],
    });

    await manager.register({
      type: "icon",
      source: "local",
      path: "/icons/home.svg",
      metadata: {},
      tags: ["ui"],
    });

    await manager.register({
      type: "image",
      source: "url",
      url: "https://example.com/2.png",
      metadata: {},
      tags: ["portrait"],
    });

    const images = await manager.query({ type: "image" });
    expect(images).toHaveLength(2);
    expect(images.every((a) => a.type === "image")).toBe(true);

    const icons = await manager.query({ type: "icon" });
    expect(icons).toHaveLength(1);
    expect(icons[0].type).toBe("icon");

    const natureAssets = await manager.query({ tags: ["nature"] });
    expect(natureAssets).toHaveLength(1);
    expect(natureAssets[0].tags).toContain("nature");

    const limited = await manager.query({ type: "image", limit: 1 });
    expect(limited).toHaveLength(1);
  });

  it("remove deletes asset", async () => {
    const manager = new AssetManager();
    const asset = await manager.register({
      type: "illustration",
      source: "generated",
      prompt: "A sunset over mountains",
      metadata: {},
      tags: ["sunset"],
    });

    expect(await manager.get(asset.id)).toBeDefined();

    await manager.remove(asset.id);

    expect(await manager.get(asset.id)).toBeUndefined();
  });

  it("fromUrl creates asset with source url", async () => {
    const manager = new AssetManager();
    const asset = await manager.fromUrl("https://example.com/pic.jpg", {
      width: 1024,
      height: 768,
    });

    expect(asset.source).toBe("url");
    expect(asset.url).toBe("https://example.com/pic.jpg");
    expect(asset.type).toBe("image");
    expect(asset.metadata.width).toBe(1024);
    expect(asset.metadata.height).toBe(768);
    expect(asset.id).toBeDefined();
    expect(asset.createdAt).toBeDefined();
    expect(asset.tags).toEqual([]);
  });

  it("fromLocal creates asset with source local", async () => {
    const manager = new AssetManager();
    const asset = await manager.fromLocal("/assets/bg.png", {
      format: "png",
    });

    expect(asset.source).toBe("local");
    expect(asset.path).toBe("/assets/bg.png");
    expect(asset.type).toBe("image");
    expect(asset.metadata.format).toBe("png");
  });
});
