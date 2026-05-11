export interface Asset {
  id: string;
  type: "image" | "icon" | "illustration";
  source: "local" | "url" | "generated";
  path?: string;
  url?: string;
  prompt?: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    alt?: string;
  };
  tags: string[];
  createdAt: string;
}

export interface AssetQuery {
  type?: Asset["type"];
  tags?: string[];
  source?: Asset["source"];
  limit?: number;
}

export interface AssetManagerConfig {
  cacheDir: string;
  maxCacheSize: number;
  supportedFormats: string[];
}
