import type { ZodSchema } from "zod";

export interface ImageInput {
  data: string;
  mimeType: string;
}

export interface TextCompletionRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  images?: ImageInput[];
  signal?: AbortSignal;
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
  images?: ImageInput[];
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

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export interface SearchRequest {
  query: string;
  maxResults?: number;
}

export interface ParseUrlRequest {
  url: string;
  maxChars?: number;
}

export interface ParsedDocument {
  title: string;
  content: string;
  url: string;
}

export interface RetrievalProvider {
  id: string;
  name: string;
  search(req: SearchRequest): Promise<SearchResult[]>;
  parseUrl?(req: ParseUrlRequest): Promise<ParsedDocument>;
  supportsWebSearch?: boolean;
  supportsUrlParsing?: boolean;
}
