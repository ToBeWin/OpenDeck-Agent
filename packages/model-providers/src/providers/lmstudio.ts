import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";

export interface LMStudioProviderOptions {
  baseUrl?: string;
  model?: string;
}

const LMSTUDIO_DEFAULT_BASE_URL = "http://localhost:1234/v1";
const LMSTUDIO_DEFAULT_MODEL = "local-model";

export function createLMStudioProvider(
  options: LMStudioProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? LMSTUDIO_DEFAULT_BASE_URL;
  const model = options.model ?? LMSTUDIO_DEFAULT_MODEL;

  return {
    id: `lmstudio-${model}`,
    name: `LM Studio (${model})`,
    type: "local",
    supportsStreaming: true,
    supportsTools: false,
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

      let response: Response;
      try {
        response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to LM Studio at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}. ` +
          "Make sure LM Studio's local API server is running."
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`LM Studio error (${response.status}): ${errorText}`);
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
