import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";
import { buildAnthropicMessages } from "./vision-utils";
import { fetchWithTimeout } from "../fetch-with-timeout";

export interface AnthropicProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

const ANTHROPIC_DEFAULT_BASE_URL = "https://api.anthropic.com/v1";
const ANTHROPIC_DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export function createAnthropicProvider(
  options: AnthropicProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? ANTHROPIC_DEFAULT_BASE_URL;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? ANTHROPIC_DEFAULT_MODEL;

  return {
    id: `anthropic-${model}`,
    name: `Anthropic (${model})`,
    type: "cloud",
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,

    async complete(req: TextCompletionRequest): Promise<TextCompletionResult> {
      const { messages, system } = buildAnthropicMessages(req.prompt, req.systemPrompt, req.images);

      const body: Record<string, unknown> = {
        model,
        max_tokens: req.maxTokens ?? 4096,
        messages,
      };
      if (system) {
        body["system"] = system;
      }
      if (req.temperature !== undefined) {
        body["temperature"] = req.temperature;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      };
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      let response: Response;
      try {
        response = await fetchWithTimeout({
          url: `${baseUrl}/messages`,
          options: { method: "POST", headers, body: JSON.stringify(body) },
          signal: req.signal,
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to Anthropic API at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        content?: Array<{ type?: string; text?: string }>;
        usage?: {
          input_tokens?: number;
          output_tokens?: number;
        };
        stop_reason?: string;
      };

      const text = (data.content ?? [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      return {
        content: text,
        usage: data.usage
          ? {
              inputTokens: data.usage.input_tokens ?? 0,
              outputTokens: data.usage.output_tokens ?? 0,
            }
          : undefined,
        finishReason: data.stop_reason ?? "stop",
      };
    },
  };
}
