import type { ZodSchema } from "zod";

export interface TextCompletionRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface TextCompletionResult {
  content: string;
  usage?: { inputTokens: number; outputTokens: number };
  finishReason: string;
}

export interface StructuredRequest<T> {
  prompt: string;
  systemPrompt?: string;
  schema: ZodSchema<T>;
  maxRetries?: number;
}

export interface TextModelProvider {
  id: string;
  name: string;
  type: "local" | "cloud";
  complete(req: TextCompletionRequest): Promise<TextCompletionResult>;
  structuredOutput?<T>(req: StructuredRequest<T>): Promise<T>;
  supportsTools?: boolean;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
}
