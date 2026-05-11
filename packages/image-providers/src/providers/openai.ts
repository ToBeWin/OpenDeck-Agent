import type {
  ImageModelProvider,
  ImageGenerationRequest,
  ImageGenerationResult,
} from "../types";

export interface OpenAIImageConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string; // default "dall-e-3"
}

interface OpenAIImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export class OpenAIImageProvider implements ImageModelProvider {
  readonly name = "openai";
  readonly supportedSizes = [
    { width: 1024, height: 1024 },
    { width: 1792, height: 1024 },
    { width: 1024, height: 1792 },
  ];

  private config: OpenAIImageConfig;

  constructor(config: OpenAIImageConfig) {
    this.config = config;
  }

  async generate(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const baseUrl = (this.config.baseUrl ?? "https://api.openai.com").replace(
      /\/$/,
      "",
    );
    const model = this.config.model ?? "dall-e-3";

    const width = request.width ?? 1024;
    const height = request.height ?? 1024;
    const size = `${width}x${height}`;

    const body: Record<string, unknown> = {
      model,
      prompt: request.prompt,
      n: request.count ?? 1,
      size,
      response_format: "b64_json",
    };

    if (request.style) {
      body.style = request.style === "natural" ? "natural" : "vivid";
    }

    const res = await fetch(`${baseUrl}/v1/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `OpenAI image generation failed (${res.status}): ${text}`,
      );
    }

    const json = (await res.json()) as OpenAIImageResponse;
    const first = json.data[0];

    if (!first) {
      throw new Error("OpenAI returned no images");
    }

    return {
      id: `openai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      base64: first.b64_json ? `data:image/png;base64,${first.b64_json}` : undefined,
      url: first.url,
      revisedPrompt: first.revised_prompt,
      metadata: {
        width,
        height,
        format: "png",
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const baseUrl = (
        this.config.baseUrl ?? "https://api.openai.com"
      ).replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/v1/models`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
