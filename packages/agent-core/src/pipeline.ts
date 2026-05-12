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
  qualityLoop?: boolean;
  minQualityScore?: number;
}

export interface PipelineWarning {
  step: string;
  message: string;
}

export async function generateDeck(
  options: GenerateDeckOptions
): Promise<Deck> {
  const warnings: PipelineWarning[] = [];

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
                } catch (err) {
                  warnings.push({
                    step: "quality.regen",
                    message: `Failed to regenerate slide ${slideScore.slideId}: ${err instanceof Error ? err.message : String(err)}`,
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      warnings.push({
        step: "quality",
        message: `Quality check skipped: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // 5. Visual planning
  try {
    const { planVisuals } = await import("@opendeck/visual-planner");
    const visualPlans = planVisuals(deck.slides);
    deck = {
      ...deck,
      metadata: {
        ...deck.metadata,
        visualPlans,
        warnings,
      } as typeof deck.metadata,
    };
  } catch (err) {
    warnings.push({
      step: "visual-planner",
      message: `Visual planning skipped: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // 6. Layout engine
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
  } catch (err) {
    warnings.push({
      step: "layout-engine",
      message: `Layout engine skipped: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Attach warnings to deck metadata if not already set
  if (!deck.metadata || !(deck.metadata as Record<string, unknown>).warnings) {
    deck = {
      ...deck,
      metadata: {
        ...(deck.metadata as Record<string, unknown>),
        warnings,
      } as typeof deck.metadata,
    };
  }

  return deck;
}
