import { z } from "zod";
import type { TextModelProvider } from "@opendeck/model-providers";
import { getStructuredOutput } from "@opendeck/model-providers";
import type { DeckPlan } from "./types";
import { buildDeckPlanPrompt } from "./prompt-builder";

const slidePlanItemSchema = z.object({
  index: z.number(),
  type: z.string(),
  layout: z.string(),
  communicationGoal: z.string(),
  mainMessage: z.string(),
  keyPoints: z.array(z.string()),
  visualSuggestion: z.string().optional(),
});

const deckPlanSchema = z.object({
  title: z.string(),
  purpose: z.string(),
  audience: z.string(),
  language: z.enum(["zh", "en", "bilingual"]),
  slideCount: z.number(),
  slides: z.array(slidePlanItemSchema),
  theme: z.string(),
});

export interface PlanDeckOptions {
  topic: string;
  purpose: string;
  audience: string;
  language: "zh" | "en" | "bilingual";
  slideCount: number;
}

export async function planDeck(
  provider: TextModelProvider,
  options: PlanDeckOptions
): Promise<DeckPlan> {
  const { systemPrompt, userPrompt } = buildDeckPlanPrompt(
    options.topic,
    options.purpose,
    options.audience,
    options.slideCount
  );

  const result = await getStructuredOutput(provider, {
    prompt: userPrompt,
    systemPrompt,
    schema: deckPlanSchema,
    maxRetries: 3,
  });

  return result;
}
