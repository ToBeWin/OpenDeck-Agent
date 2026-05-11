import type {
  ImageModelProvider,
  ImageGenerationRequest,
  ImageGenerationResult,
} from "../types";

export class MockImageProvider implements ImageModelProvider {
  readonly name = "mock";
  readonly supportedSizes = [{ width: 1024, height: 1024 }];

  async generate(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const width = request.width ?? 1024;
    const height = request.height ?? 1024;
    const truncated =
      request.prompt.length > 120
        ? request.prompt.slice(0, 117) + "..."
        : request.prompt;

    // Build a simple SVG placeholder with the prompt text
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#e0e0e0"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="14" fill="#666">
    ${escapeXml(truncated)}
  </text>
</svg>`;

    const base64 = Buffer.from(svg).toString("base64");

    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      base64: `data:image/svg+xml;base64,${base64}`,
      metadata: {
        width,
        height,
        format: "svg+xml",
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
