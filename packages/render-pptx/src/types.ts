export interface RenderRequest {
  deck: unknown; // Slide DSL Deck JSON
  outputPath?: string;
  format?: "pptx" | "pdf";
}

export interface RenderStats {
  slides: number;
  textObjects: number;
  images: number;
  charts: number;
  tables: number;
}

export interface RenderResult {
  success: boolean;
  outputPath?: string;
  stats?: RenderStats;
  error?: string;
}

export interface RenderClientConfig {
  sidecarPath?: string; // Path to node-renderer sidecar
  timeout?: number;     // Timeout in ms (default 30000)
}
