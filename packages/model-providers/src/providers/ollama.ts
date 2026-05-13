import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";
import { fetchWithTimeout } from "../fetch-with-timeout";

export interface OllamaProviderOptions {
  baseUrl?: string;
  model?: string;
}

export interface OllamaDetectionResult {
  available: boolean;
  models: string[];
}

/**
 * Detect whether Ollama is running at the configured baseUrl.
 * Hits GET /api/tags and returns available models.
 */
export async function detectOllama(
  baseUrl = "http://localhost:11434"
): Promise<OllamaDetectionResult> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { available: false, models: [] };
    }

    const data = (await response.json()) as {
      models?: Array<{ name?: string }>;
    };

    const models = (data.models ?? [])
      .map((m) => m.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0);

    return { available: true, models };
  } catch {
    return { available: false, models: [] };
  }
}

/**
 * List available model names from Ollama's /api/tags endpoint.
 * Throws with a helpful message if Ollama is not reachable.
 */
export async function listModels(
  baseUrl = "http://localhost:11434"
): Promise<string[]> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    throw new Error(
      `Failed to connect to Ollama at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}. ` +
        "Make sure Ollama is running: ollama serve"
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown error");
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    models?: Array<{ name?: string }>;
  };

  return (data.models ?? [])
    .map((m) => m.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

export function createOllamaProvider(
  options: OllamaProviderOptions = {}
): TextModelProvider {
  const baseUrl = options.baseUrl ?? "http://localhost:11434";
  const model = options.model ?? "llama3";

  return {
    id: `ollama-${model}`,
    name: `Ollama (${model})`,
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

      const body: Record<string, unknown> = {
        model,
        messages,
        stream: false,
        options: {},
      };

      if (req.maxTokens !== undefined) {
        (body.options as Record<string, unknown>).num_predict = req.maxTokens;
      }
      if (req.temperature !== undefined) {
        (body.options as Record<string, unknown>).temperature = req.temperature;
      }

      let response: Response;
      try {
        response = await fetchWithTimeout({
          url: `${baseUrl}/api/chat`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          signal: req.signal,
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to Ollama at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}. ` +
            "Make sure Ollama is running: ollama serve"
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(
          `Ollama API error (${response.status}): ${errorText}`
        );
      }

      const data = (await response.json()) as {
        message?: { content?: string };
        eval_count?: number;
        prompt_eval_count?: number;
        done?: boolean;
      };

      const content = data.message?.content ?? "";

      return {
        content,
        usage: {
          inputTokens: data.prompt_eval_count ?? 0,
          outputTokens: data.eval_count ?? 0,
        },
        finishReason: data.done ? "stop" : "length",
      };
    },
  };
}
