import type { Slide, SlideElement } from "@opendeck/slide-dsl";
import type { VisualSuggestion } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────

function hasElement(slide: Slide, type: SlideElement["type"]): boolean {
  return slide.elements.some((el) => el.type === type);
}

function countElements(slide: Slide, type: SlideElement["type"]): number {
  return slide.elements.filter((el) => el.type === type).length;
}

function hasNumericalData(slide: Slide): boolean {
  const textContent = slide.elements
    .filter((el): el is Extract<SlideElement, { type: "text" }> => el.type === "text")
    .map((el) => el.content)
    .join(" ");
  return /\d+%|\d+\.\d+|\$\d+|\d{2,}/.test(textContent);
}

function hasListContent(slide: Slide): boolean {
  const textContent = slide.elements
    .filter((el): el is Extract<SlideElement, { type: "text" }> => el.type === "text")
    .map((el) => el.content)
    .join("\n");
  return /(^|\n)\s*[-*•]\s/.test(textContent) || /(^|\n)\s*\d+[.)]\s/.test(textContent);
}

// Default positions for different visual types
const IMAGE_POSITION = { x: 620, y: 80, w: 340, h: 400 };
const CHART_POSITION = { x: 80, y: 200, w: 840, h: 360 };
const ICON_POSITION = { x: 60, y: 180, w: 40, h: 40 };

// ─── Core analyzer ────────────────────────────────────────────────────

export function analyzeSlide(slide: Slide): VisualSuggestion[] {
  const suggestions: VisualSuggestion[] = [];
  const hasImage = hasElement(slide, "image");
  const hasChart = hasElement(slide, "chart");
  const textCount = countElements(slide, "text");

  // Rule: data_chart slide without chart → high priority chart
  if (slide.type === "data_chart" && !hasChart) {
    suggestions.push({
      type: "chart",
      targetSlideId: slide.id,
      position: CHART_POSITION,
      rationale: "Slide is designated as data_chart but has no chart element",
      priority: "high",
      config: { chartType: "bar", source: "structured_data" },
    });
    return suggestions; // high-priority rule, skip further analysis
  }

  // Rule: cover slide without image → hero image
  if (slide.type === "cover" && !hasImage) {
    suggestions.push({
      type: "image",
      targetSlideId: slide.id,
      position: { x: 0, y: 0, w: 1000, h: 560 },
      rationale: "Cover slide needs a hero background image",
      priority: "high",
      config: { role: "hero", sourceType: "ai_generated" },
    });
    return suggestions;
  }

  // Rule: > 3 text elements and no image → suggest image
  if (textCount > 3 && !hasImage) {
    suggestions.push({
      type: "image",
      targetSlideId: slide.id,
      position: IMAGE_POSITION,
      rationale: `Slide has ${textCount} text elements with no image to break up the content`,
      priority: "medium",
      config: { role: "illustration" },
    });
  }

  // Rule: numerical data patterns and no chart → suggest chart
  if (hasNumericalData(slide) && !hasChart) {
    suggestions.push({
      type: "chart",
      targetSlideId: slide.id,
      position: CHART_POSITION,
      rationale: "Slide contains numerical data that could be visualized as a chart",
      priority: "medium",
      config: { chartType: "bar" },
    });
  }

  // Rule: list-like content → suggest icon bullets
  if (hasListContent(slide)) {
    suggestions.push({
      type: "icon",
      targetSlideId: slide.id,
      position: ICON_POSITION,
      rationale: "Slide has list content that would benefit from icon bullets",
      priority: "low",
      config: { style: "bullet" },
    });
  }

  return suggestions;
}
