import type { Asset, AssetQuery, AssetManagerConfig } from "./types";

export class AssetCache {
  private config: AssetManagerConfig;
  private index: Map<string, Asset>;

  constructor(config: AssetManagerConfig) {
    this.config = config;
    this.index = new Map();
  }

  async get(id: string): Promise<Asset | undefined> {
    return this.index.get(id);
  }

  async set(asset: Asset): Promise<void> {
    this.index.set(asset.id, asset);
  }

  async has(id: string): Promise<boolean> {
    return this.index.has(id);
  }

  async delete(id: string): Promise<void> {
    this.index.delete(id);
  }

  async query(q: AssetQuery): Promise<Asset[]> {
    let results = Array.from(this.index.values());

    if (q.type) {
      results = results.filter((a) => a.type === q.type);
    }

    if (q.source) {
      results = results.filter((a) => a.source === q.source);
    }

    if (q.tags && q.tags.length > 0) {
      results = results.filter((a) =>
        q.tags!.some((tag) => a.tags.includes(tag))
      );
    }

    if (q.limit) {
      results = results.slice(0, q.limit);
    }

    return results;
  }

  async clear(): Promise<void> {
    this.index.clear();
  }

  async size(): Promise<number> {
    return this.index.size;
  }
}
