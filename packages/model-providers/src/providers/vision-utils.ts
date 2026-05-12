import type { ImageInput } from "../types";

interface ChatMessage {
  role: string;
  content: string | Array<Record<string, unknown>>;
}

/**
 * Build messages array with image support for OpenAI-compatible APIs.
 * Messages use the content array format when images are present:
 *   [{ role, content: [{type:"text",text}, {type:"image_url",image_url:{url}}] }]
 */
export function buildOpenAIMessages(
  prompt: string,
  systemPrompt?: string,
  images?: ImageInput[]
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  if (images && images.length > 0) {
    const content: Array<Record<string, unknown>> = [
      { type: "text", text: prompt },
    ];
    for (const img of images) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${img.mimeType};base64,${img.data}` },
      });
    }
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: prompt });
  }
  return messages;
}

/**
 * Build messages for Anthropic API format.
 * Anthropic uses content blocks with type "image" and base64 source.
 */
export function buildAnthropicMessages(
  prompt: string,
  systemPrompt?: string,
  images?: ImageInput[]
): { messages: ChatMessage[]; system?: string } {
  const system = systemPrompt;
  if (images && images.length > 0) {
    const content: Array<Record<string, unknown>> = [
      { type: "text", text: prompt },
    ];
    for (const img of images) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mimeType,
          data: img.data,
        },
      });
    }
    return { messages: [{ role: "user", content }], system };
  }
  return {
    messages: [{ role: "user", content: prompt }],
    system,
  };
}

/**
 * Build Gemini content parts array with image support.
 */
export function buildGeminiContents(
  prompt: string,
  systemPrompt?: string,
  images?: ImageInput[]
): {
  contents: Array<{ role: string; parts: Array<Record<string, unknown>> }>;
  systemInstruction?: { parts: Array<{ text: string }> };
} {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (images) {
    for (const img of images) {
      parts.push({
        inline_data: { mime_type: img.mimeType, data: img.data },
      });
    }
  }
  const contents = [{ role: "user", parts }];
  const systemInstruction = systemPrompt
    ? { parts: [{ text: systemPrompt }] }
    : undefined;
  return { contents, systemInstruction };
}
