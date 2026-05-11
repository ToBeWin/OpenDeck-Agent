import { z } from "zod";
import type { TextModelProvider } from "@opendeck/model-providers";
import { getStructuredOutput } from "@opendeck/model-providers";
import type { ParsedIntent } from "./types";
import { buildIntentPrompt } from "./prompt-builder";

const intentSchema = z.object({
  intent: z.enum([
    "generate_deck",
    "modify_deck",
    "modify_slide",
    "change_style",
    "change_audience",
    "compress_deck",
    "expand_deck",
    "add_slide",
    "delete_slide",
    "rewrite_content",
    "generate_speaker_notes",
    "generate_visual_assets",
    "replace_image",
    "export_file",
    "ask_question",
  ]),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.unknown()).default({}),
});

export async function parseIntent(
  provider: TextModelProvider,
  userMessage: string,
  projectState?: { title?: string; slideCount?: number; theme?: string }
): Promise<ParsedIntent> {
  const { systemPrompt, userPrompt } = buildIntentPrompt(
    userMessage,
    projectState
  );

  const result = await getStructuredOutput(provider, {
    prompt: userPrompt,
    systemPrompt,
    schema: intentSchema,
    maxRetries: 3,
  });

  return {
    intent: result.intent,
    confidence: result.confidence,
    parameters: result.parameters,
    rawMessage: userMessage,
  };
}
