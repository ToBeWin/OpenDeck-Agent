export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: "natural" | "artistic" | "photographic" | "illustration";
  count?: number;
}

export interface ImageGenerationResult {
  id: string;
  url?: string;
  base64?: string;
  revisedPrompt?: string;
  metadata: {
    width: number;
    height: number;
    format: string;
  };
}

export interface ImageModelProvider {
  readonly name: string;
  readonly supportedSizes: Array<{ width: number; height: number }>;

  generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
  isAvailable(): Promise<boolean>;
}
