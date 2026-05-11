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
  /** Enable quality feedback loop (re-generate low-scoring slides) */
  qualityLoop?: boolean;
  /** Minimum quality score to accept (default 60) */
  minQualityScore?: number;
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
  let deck = await generateSlideDSL(
    options.provider,
    plan,
    options.theme ?? "bloomberg_dark"
  );

  // 4. Quality feedback loop (optional)
  if (options.qualityLoop !== false) {
    try {
      const { scoreDeck } = await import("@opendeck/quality");
      const score = scoreDeck(deck);
      const minScore = options.minQualityScore ?? 60;

      if (score.overall < minScore) {
        // Re-generate slides with low scores
        for (const slideScore of score.slides) {
          if (slideScore.overall < minScore) {
            const slideIndex = deck.slides.findIndex(
              (s) => s.id === slideScore.slideId
            );
            if (slideIndex >= 0) {
              const slidePlan = plan.slides[slideIndex];
              if (slidePlan) {
                try {
                  const { generateSlideDSL } = await import("./slide-architect");
                  const improvedSlide = await generateSlideDSL(
                    options.provider,
                    { ...plan, slides: [slidePlan] },
                    options.theme ?? "bloomberg_dark"
                  );
                  if (improvedSlide.slides[0]) {
                    deck.slides[slideIndex] = improvedSlide.slides[0];
                  }
                } catch {
                  // Keep original slide if re-generation fails
                }
              }
            }
          }
        }
      }
    } catch {
      // Quality package not available, skip quality loop
    }
  }

  // 5. Visual planning (add position suggestions)
  try {
    const { planVisuals } = await import("@opendeck/visual-planner");
    const visualPlans = planVisuals(deck.slides);
    // Store visual plans in metadata for the renderer to use
    deck = {
      ...deck,
      metadata: {
        ...deck.metadata,
        visualPlans,
      } as typeof deck.metadata,
    };
  } catch {
    // Visual planner not available, skip
  }

  // 6. Layout engine (position elements)
  try {
    const { LayoutEngine } = await import("@opendeck/layout-engine");
    const engine = new LayoutEngine();
    deck = {
      ...deck,
      slides: deck.slides.map((slide) => {
        const elements = slide.elements.map((el) => ({
          id: el.id,
          type: el.type as string,
          role: "role" in el ? (el as { role?: string }).role : undefined,
          rect: { x: 0, y: 0, w: 0, h: 0 },
        }));
        const positioned = engine.autoLayout(
          elements.map((e) => ({
            type: e.type as "text" | "image" | "chart" | "table" | "shape" | "icon",
            role: e.role,
            content: undefined,
          }))
        );
        return {
          ...slide,
          elements: slide.elements.map((el, i) => ({
            ...el,
            position: positioned[i]?.rect ?? ("position" in el ? (el as { position?: unknown }).position : undefined),
          })),
        } as typeof slide;
      }),
    };
  } catch {
    // Layout engine not available, skip
  }

  return deck;
}
