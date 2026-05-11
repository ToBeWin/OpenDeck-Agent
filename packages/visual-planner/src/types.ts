import type { Slide } from "@opendeck/slide-dsl";

export interface VisualSuggestion {
  type: "image" | "chart" | "icon" | "shape";
  targetSlideId: string;
  position: { x: number; y: number; w: number; h: number };
  rationale: string;
  priority: "high" | "medium" | "low";
  config: Record<string, unknown>;
}

export interface VisualPlan {
  slideId: string;
  suggestions: VisualSuggestion[];
  hasVisualBalance: boolean;
  imageCount: number;
  chartCount: number;
}
