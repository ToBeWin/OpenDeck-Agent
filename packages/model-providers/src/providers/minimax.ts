import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";
import { fetchWithTimeout } from "../fetch-with-timeout";

export type MiniMaxRegion = "domestic" | "international";

export interface MiniMaxProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  region?: MiniMaxRegion;
}

const MINIMAX_DOMESTIC_BASE_URL = "https://api.minimax.chat/v1";
const MINIMAX_INTERNATIONAL_BASE_URL = "https://api.minimax.chat/v1";
const MINIMAX_DOMESTIC_MODEL = "MiniMax-Text-01";
const MINIMAX_INTERNATIONAL_MODEL = "MiniMax-Text-01";

function getMiniMaxDefaults(region: MiniMaxRegion = "domestic") {
  return {
    baseUrl:
      region === "domestic"
        ? MINIMAX_DOMESTIC_BASE_URL
        : MINIMAX_INTERNATIONAL_BASE_URL,
    model:
      region === "domestic"
        ? MINIMAX_DOMESTIC_MODEL
        : MINIMAX_INTERNATIONAL_MODEL,
    regionLabel: region === "domestic" ? "国内" : "国际",
  };
}

export function createMiniMaxProvider(
  options: MiniMaxProviderOptions = {}
): TextModelProvider {
  const region = options.region ?? "domestic";
  const defaults = getMiniMaxDefaults(region);
  const baseUrl = options.baseUrl ?? defaults.baseUrl;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? defaults.model;
  const regionLabel = defaults.regionLabel;

  return {
    id: `minimax-${region}-${model}`,
    name: `MiniMax ${regionLabel} (${model})`,
    type: "cloud",
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,

    async complete(req: TextCompletionRequest): Promise<TextCompletionResult> {
      const messages: Array<{ role: string; content: string }> = [];
      if (req.systemPrompt) {
        messages.push({ role: "system", content: req.systemPrompt });
      }
      messages.push({ role: "user", content: req.prompt });

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
          `Failed to connect to MiniMax API at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`MiniMax API error (${response.status}): ${errorText}`);
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
