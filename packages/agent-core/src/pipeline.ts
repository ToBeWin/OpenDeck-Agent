import type { TextModelProvider } from "@opendeck/model-providers";
import type { Deck } from "@opendeck/slide-dsl";
import { parseIntent } from "./intent-agent";
import { planDeck } from "./deck-planner";
import { generateSlideDSL } from "./slide-architect";

export interface GenerateDeckOptions {
  prompt: string;
  purpose?: string;
  audience?: string;
  language?: "zh" | "en" | "bilingual";
  slideCount?: number;
  theme?: string;
  provider: TextModelProvider;
}

export async function generateDeck(
  options: GenerateDeckOptions
): Promise<Deck> {
  // 1. Parse intent
  const intent = await parseIntent(options.provider, options.prompt);

  // 2. Plan deck structure
  const plan = await planDeck(options.provider, {
    topic: options.prompt,
    purpose:
      (intent.parameters.purpose as string) ??
      options.purpose ??
      "business_report",
    audience: options.audience ?? "general",
    language: options.language ?? "zh",
    slideCount: options.slideCount ?? 10,
  });

  // 3. Generate Slide DSL
  const deck = await generateSlideDSL(
    options.provider,
    plan,
    options.theme ?? "bloomberg_dark"
  );

  return deck;
}
