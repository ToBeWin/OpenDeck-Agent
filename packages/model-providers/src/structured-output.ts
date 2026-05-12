import type { TextModelProvider, StructuredRequest } from "./types";

export async function getStructuredOutput<T>(
  provider: TextModelProvider,
  req: StructuredRequest<T>
): Promise<T> {
  const maxRetries = req.maxRetries ?? 3;
  let lastError: Error | undefined;
  let prompt = req.prompt;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await provider.complete({
        prompt,
        systemPrompt: req.systemPrompt,
        temperature: 0.1,
        images: req.images,
      });

      // Try to extract JSON from response
      const json = extractJson(result.content);
      return req.schema.parse(json);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // If JSON parse or schema validation failed, retry with error feedback
      if (attempt < maxRetries - 1) {
        prompt = `${prompt}\n\nPrevious attempt failed: ${lastError.message}\nPlease return valid JSON.`;
      }
    }
  }
  throw lastError ?? new Error("Structured output failed");
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
