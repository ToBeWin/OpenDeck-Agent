import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
} from "../types";
import { buildOpenAIMessages } from "./vision-utils";

export type GLMRegion = "domestic" | "international";

export interface GLMProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  region?: GLMRegion;
}

const GLM_DOMESTIC_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const GLM_INTERNATIONAL_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const GLM_DOMESTIC_MODEL = "glm-4-plus";
const GLM_INTERNATIONAL_MODEL = "glm-4-plus";

function getGLMDefaults(region: GLMRegion = "domestic") {
  return {
    baseUrl:
      region === "domestic"
        ? GLM_DOMESTIC_BASE_URL
        : GLM_INTERNATIONAL_BASE_URL,
    model:
      region === "domestic"
        ? GLM_DOMESTIC_MODEL
        : GLM_INTERNATIONAL_MODEL,
    regionLabel: region === "domestic" ? "国内" : "国际",
  };
}

export function createGLMProvider(
  options: GLMProviderOptions = {}
): TextModelProvider {
  const region = options.region ?? "domestic";
  const defaults = getGLMDefaults(region);
  const baseUrl = options.baseUrl ?? defaults.baseUrl;
  const apiKey = options.apiKey ?? "";
  const model = options.model ?? defaults.model;
  const regionLabel = defaults.regionLabel;

  return {
    id: `glm-${region}-${model}`,
    name: `GLM ${regionLabel} (${model})`,
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
        response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to GLM API at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(`GLM API error (${response.status}): ${errorText}`);
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
