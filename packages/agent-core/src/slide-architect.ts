import { z } from "zod";
import type { TextModelProvider } from "@opendeck/model-providers";
import { getStructuredOutput } from "@opendeck/model-providers";
import { getTheme } from "@opendeck/templates";
import type { Deck, Slide, ThemeSpec } from "@opendeck/slide-dsl";
import { validateDeck } from "@opendeck/slide-dsl";
import type { DeckPlan } from "./types";
import { buildSlidePrompt } from "./prompt-builder";

const textElementSchema = z.object({
  id: z.string(),
  type: z.literal("text"),
  role: z.enum([
    "title",
    "subtitle",
    "headline",
    "body",
    "caption",
    "label",
    "metric",
    "footnote",
  ]),
  content: z.string(),
  editable: z.literal(true),
});

const imageElementSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  role: z.enum([
    "hero",
    "background",
    "illustration",
    "avatar",
    "logo",
    "supporting",
  ]),
  source: z.string(),
  sourceType: z.enum(["local", "generated", "web", "embedded"]),
  editable: z.boolean(),
});

const tableElementSchema = z.object({
  id: z.string(),
  type: z.literal("table"),
  role: z.enum(["comparison", "data", "summary", "pricing", "roadmap"]),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  editable: z.literal(true),
});

const chartElementSchema = z.object({
  id: z.string(),
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "pie", "area", "scatter", "combo"]),
  role: z.enum(["evidence", "trend", "comparison", "breakdown"]),
  data: z.object({
    categories: z.array(z.string()).optional(),
    series: z
      .array(z.object({ name: z.string(), values: z.array(z.number()) }))
      .optional(),
    labels: z.array(z.string()).optional(),
    values: z.array(z.number()).optional(),
  }),
  editable: z.boolean(),
});

const slideElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  imageElementSchema,
  tableElementSchema,
  chartElementSchema,
]);

const slideSchema = z.object({
  id: z.string(),
  index: z.number(),
  type: z.string(),
  layout: z.string(),
  communicationGoal: z.string(),
  mainMessage: z.string(),
  elements: z.array(slideElementSchema),
  speakerNote: z.string().optional(),
});

function makeThemeSpec(themeId: string): ThemeSpec {
  const found = getTheme(themeId);
  if (found) return found;

  // Fallback to a basic theme if not found
  return {
    id: `theme_${themeId}`,
    name: themeId,
    style: "bloomberg_dark",
    colors: {
      primary: "#FFA726",
      secondary: "#78909C",
      accent: "#00E5FF",
      background: "#121212",
      surface: "#1E1E1E",
      textPrimary: "#F5F5F5",
      textSecondary: "#9E9E9E",
      textInverse: "#121212",
      border: "#333333",
      success: "#00E676",
      warning: "#FFAB40",
      error: "#FF5252",
      chartColors: [
        "#00E5FF",
        "#FFA726",
        "#00E676",
        "#FF5252",
        "#7C4DFF",
        "#FFD740",
        "#FF4081",
        "#64FFDA",
      ],
    },
    typography: {
      titleFont: "Inter",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
      titleSize: 36,
      subtitleSize: 22,
      bodySize: 16,
      captionSize: 13,
      titleWeight: "600",
      bodyWeight: "normal",
      lineHeight: 1.35,
    },
    spacing: {
      slidePaddingX: 0.9,
      slidePaddingY: 0.6,
      elementGap: 0.3,
      sectionGap: 0.6,
    },
    shapes: {
      cornerRadius: 6,
      lineWidth: 1,
      lineColor: "#444444",
    },
    chart: {
      axisColor: "#616161",
      gridColor: "#2C2C2C",
      labelColor: "#BDBDBD",
      fontFamily: "Inter",
    },
    image: {
      borderRadius: 6,
      overlayOpacity: 0.5,
      overlayColor: "#000000",
    },
    density: "high",
    defaultVisualIntensity: "medium",
  };
}

export async function generateSlideDSL(
  provider: TextModelProvider,
  plan: DeckPlan,
  themeId?: string,
  onProgress?: (slideIndex: number, total: number, label: string) => void
): Promise<Deck> {
  const resolvedThemeId = themeId ?? plan.theme;
  const themeSpec = makeThemeSpec(resolvedThemeId);

  // Parallel generation with concurrency limit of 4
  const CONCURRENCY = 4;
  const slides: Slide[] = [];
  const allPlans = plan.slides;

  for (let batch = 0; batch < allPlans.length; batch += CONCURRENCY) {
    const batchPlans = allPlans.slice(batch, batch + CONCURRENCY);
    const batchResults = await Promise.all(
      batchPlans.map(async (slidePlan) => {
        const { systemPrompt, userPrompt } = buildSlidePrompt(slidePlan, {
          id: themeSpec.id,
          name: themeSpec.name,
          style: themeSpec.style,
        });

        const slideResult = await getStructuredOutput(provider, {
          prompt: userPrompt,
          systemPrompt,
          schema: slideSchema,
          maxRetries: 2,
        });

        return slideResult;
      })
    );

    for (const slideResult of batchResults) {
      const idx = slideResult.index;
      slides.push({
        id: slideResult.id,
        index: idx,
        type: slideResult.type as Slide["type"],
        layout: slideResult.layout as Slide["layout"],
        communicationGoal: slideResult.communicationGoal,
        mainMessage: slideResult.mainMessage,
        elements: slideResult.elements as Slide["elements"],
        speakerNote: slideResult.speakerNote,
      });
      if (onProgress) {
        onProgress(idx + 1, allPlans.length, `Slide ${idx + 1}`);
      }
    }
  }

  const deck: Deck = {
    id: `deck_${Date.now()}`,
    title: plan.title,
    language: plan.language,
    aspectRatio: "16:9",
    purpose: "custom",
    audience: { name: plan.audience, level: "general" },
    theme: themeSpec,
    slides,
    metadata: {
      createdAt: new Date().toISOString(),
      version: "0.1.0",
    },
  };

  const validation = validateDeck(deck);
  if (!validation.valid) {
    // Deck had validation issues but we return it anyway for now
    // In production, we might want to retry or fix issues
  }

  return deck;
}
