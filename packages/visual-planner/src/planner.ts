import type { Slide } from "@opendeck/slide-dsl";
import type { VisualPlan, VisualSuggestion } from "./types";
import { analyzeSlide } from "./analyzer";

/**
 * Determine whether a slide has a reasonable balance of text and visuals.
 * A slide is considered balanced if it has at least one image or chart
 * and the text element count is 4 or fewer.
 */
function hasVisualBalance(slide: Slide, suggestions: VisualSuggestion[]): boolean {
  const existingImages = slide.elements.filter((el) => el.type === "image").length;
  const existingCharts = slide.elements.filter((el) => el.type === "chart").length;
  const textCount = slide.elements.filter((el) => el.type === "text").length;

  const suggestedImages = suggestions.filter((s) => s.type === "image").length;
  const suggestedCharts = suggestions.filter((s) => s.type === "chart").length;

  const totalImages = existingImages + suggestedImages;
  const totalCharts = existingCharts + suggestedCharts;

  return totalImages + totalCharts > 0 && textCount <= 4;
}

/**
 * Plan visuals for an entire deck.
 * Analyzes each slide individually, then aggregates results into VisualPlan objects.
 */
export function planVisuals(slides: Slide[]): VisualPlan[] {
  return slides.map((slide) => {
    const suggestions = analyzeSlide(slide);

    const imageCount =
      slide.elements.filter((el) => el.type === "image").length +
      suggestions.filter((s) => s.type === "image").length;

    const chartCount =
      slide.elements.filter((el) => el.type === "chart").length +
      suggestions.filter((s) => s.type === "chart").length;

    return {
      slideId: slide.id,
      suggestions,
      hasVisualBalance: hasVisualBalance(slide, suggestions),
      imageCount,
      chartCount,
    };
  });
}
