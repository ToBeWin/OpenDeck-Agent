import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";
import { buildOpenAIMessages } from "./vision-utils";

export interface KimiProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

const KIMI_DEFAULT_BASE_URL = "https://api.moonshot.cn/v1";
const KIMI_DEFAULT_MODEL = "moonshot-v1-8k";

export function createKimiProvider(
  options: KimiProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? KIMI_DEFAULT_BASE_URL;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? KIMI_DEFAULT_MODEL;

  return {
    id: `kimi-${model}`,
    name: `Kimi (${model})`,
    type: "cloud",
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,

    async complete(req: TextCompletionRequest): Promise<TextCompletionResult> {
      const messages = buildOpenAIMessages(req.prompt, req.systemPrompt, req.images);

      const body: Record<string, unknown> = { model, messages };
      if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;
      if (req.temperature !== undefined) body.temperature = req.temperature;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      let response: Response;
      try {
        response = await fetchWithTimeout({
          url: `${baseUrl}/chat/completions`,
          options: { method: "POST",
          headers,
          body: JSON.stringify(body),
        },
          signal: req.signal,
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to Kimi API at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`Kimi API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: { content?: string };
          finish_reason?: string;
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
        };
      };

      const choice = data.choices?.[0];
      const content = choice?.message?.content ?? "";

      return {
        content,
        usage: data.usage
          ? {
              inputTokens: data.usage.prompt_tokens ?? 0,
              outputTokens: data.usage.completion_tokens ?? 0,
            }
          : undefined,
        finishReason: choice?.finish_reason ?? "stop",
      };
    },
  };
}
