import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";
import { buildGeminiContents } from "./vision-utils";

export interface GeminiProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

const GEMINI_DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_DEFAULT_MODEL = "gemini-1.5-flash";

export function createGeminiProvider(
  options: GeminiProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? GEMINI_DEFAULT_BASE_URL;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? GEMINI_DEFAULT_MODEL;

  return {
    id: `gemini-${model}`,
    name: `Gemini (${model})`,
    type: "cloud",
    supportsStreaming: true,
    supportsTools: false,
    supportsVision: true,

    async complete(req: TextCompletionRequest): Promise<TextCompletionResult> {
      const { contents, systemInstruction } = buildGeminiContents(req.prompt, req.systemPrompt, req.images);

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {},
      };
      if (systemInstruction) {
        body["systemInstruction"] = systemInstruction;
      }
      if (req.maxTokens !== undefined) {
        (body.generationConfig as Record<string, unknown>).maxOutputTokens = req.maxTokens;
      }
      if (req.temperature !== undefined) {
        (body.generationConfig as Record<string, unknown>).temperature = req.temperature;
      }

      let response: Response;
      try {
        const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to Gemini API at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
          finishReason?: string;
        }>;
        usageMetadata?: {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
        };
      };

      const candidate = data.candidates?.[0];
      const text = (candidate?.content?.parts ?? [])
        .map((p) => p.text ?? "")
        .join("");

      return {
        content: text,
        usage: data.usageMetadata
          ? {
              inputTokens: data.usageMetadata.promptTokenCount ?? 0,
              outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            }
          : undefined,
        finishReason: candidate?.finishReason ?? "stop",
      };
    },
  };
}
