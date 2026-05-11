import { nanoid } from "nanoid";
import type { Asset, AssetQuery, AssetManagerConfig } from "./types";
import { AssetCache } from "./cache";

const DEFAULT_CONFIG: AssetManagerConfig = {
  cacheDir: ".asset-cache",
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: ["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"],
};

export class AssetManager {
  private cache: AssetCache;

  constructor(config?: Partial<AssetManagerConfig>) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    this.cache = new AssetCache(merged);
  }

  async register(
    asset: Omit<Asset, "id" | "createdAt">
  ): Promise<Asset> {
    const full: Asset = {
      ...asset,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    await this.cache.set(full);
    return full;
  }

  async get(id: string): Promise<Asset | undefined> {
    return this.cache.get(id);
  }

  async query(q: AssetQuery): Promise<Asset[]> {
    return this.cache.query(q);
  }

  async remove(id: string): Promise<void> {
    await this.cache.delete(id);
  }

  async fromUrl(
    url: string,
    meta?: Partial<Asset["metadata"]>
  ): Promise<Asset> {
    return this.register({
      type: "image",
      source: "url",
      url,
      metadata: {
        ...meta,
      },
      tags: [],
    });
  }

  async fromLocal(
    path: string,
    meta?: Partial<Asset["metadata"]>
  ): Promise<Asset> {
    return this.register({
      type: "image",
      source: "local",
      path,
      metadata: {
        ...meta,
      },
      tags: [],
    });
  }
}
