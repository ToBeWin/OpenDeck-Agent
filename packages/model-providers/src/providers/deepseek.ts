import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";

export interface DeepSeekProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

const DEEPSEEK_DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
const DEEPSEEK_DEFAULT_MODEL = "deepseek-chat";

export function createDeepSeekProvider(
  options: DeepSeekProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? DEEPSEEK_DEFAULT_BASE_URL;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? DEEPSEEK_DEFAULT_MODEL;

  return {
    id: `deepseek-${model}`,
    name: `DeepSeek (${model})`,
    type: "cloud",
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,

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
        response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to DeepSeek API at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
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
