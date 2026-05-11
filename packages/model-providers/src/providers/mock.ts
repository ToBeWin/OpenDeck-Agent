import type {
  TextModelProvider,
  TextCompletionRequest,
  TextCompletionResult,
  StructuredRequest,
} from "../types";

export interface MockProviderOptions {
  response?: string;
  responses?: string[];
  usage?: { inputTokens: number; outputTokens: number };
  finishReason?: string;
}

export function createMockProvider(
  options: MockProviderOptions = {}
): TextModelProvider {
  let callIndex = 0;

  return {
    id: "mock",
    name: "Mock Provider",
    type: "local",
    supportsStreaming: false,
    supportsTools: false,
    supportsVision: false,

    async complete(req: TextCompletionRequest): Promise<TextCompletionResult> {
      let content: string;
      if (options.responses && options.responses.length > 0) {
        content = options.responses[callIndex % options.responses.length];
        callIndex++;
      } else {
        content = options.response ?? '{"message": "mock response"}';
      }

      return {
        content,
        usage: options.usage ?? { inputTokens: 10, outputTokens: 20 },
        finishReason: options.finishReason ?? "stop",
      };
    },

    async structuredOutput<T>(req: StructuredRequest<T>): Promise<T> {
      const result = await this.complete({
        prompt: req.prompt,
        systemPrompt: req.systemPrompt,
        temperature: 0.1,
      });

      const json = extractJson(result.content);
      return req.schema.parse(json);
    },
  };
}

function extractJson(text: string): unknown {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {}
  // Try extracting from markdown code block
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }
  // Try finding first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }
  throw new Error("No valid JSON found in response");
}
