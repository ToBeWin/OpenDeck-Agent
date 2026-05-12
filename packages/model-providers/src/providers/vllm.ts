import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";

export interface VLLMProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

const VLLM_DEFAULT_BASE_URL = "http://localhost:8000/v1";
const VLLM_DEFAULT_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

export function createVLLMProvider(
  options: VLLMProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? VLLM_DEFAULT_BASE_URL;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? VLLM_DEFAULT_MODEL;

  return {
    id: `vllm-${model.replace(/\//g, "-")}`,
    name: `vLLM (${model})`,
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
          `Failed to connect to vLLM at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}. ` +
          "Make sure the vLLM server is running."
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`vLLM error (${response.status}): ${errorText}`);
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
