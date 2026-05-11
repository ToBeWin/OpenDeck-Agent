import type { LayoutElement, LayoutConfig, LayoutRect } from "./types";
import { titleRule, bodyRule, twoColumnRule, imageRule, chartRule } from "./rules";
import { snapToGrid } from "./grid";

const DEFAULT_CONFIG: LayoutConfig = {
  canvas: { x: 0, y: 0, w: 13.333, h: 7.5 },
  margin: 0.5,
  gutter: 0.25,
  baselineGrid: 0.125,
};

const SLIDE_RULES: Record<string, string[]> = {
  title: ["title"],
  content: ["title", "body"],
  twoColumn: ["title", "twoColumn"],
  image: ["title", "image"],
  chart: ["title", "chart"],
};

const ALL_RULES = [titleRule, bodyRule, twoColumnRule, imageRule, chartRule];

export class LayoutEngine {
  private config: LayoutConfig;

  constructor(config?: Partial<LayoutConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  layout(elements: LayoutElement[], slideType?: string): LayoutElement[] {
    const ruleNames = slideType
      ? SLIDE_RULES[slideType] ?? []
      : [];

    let result = elements.map((el) => ({ ...el, rect: { ...el.rect } }));

    // Apply margin inset to canvas for rule calculations
    const innerCanvas: LayoutRect = {
      x: this.config.canvas.x + this.config.margin,
      y: this.config.canvas.y + this.config.margin,
      w: this.config.canvas.w - this.config.margin * 2,
      h: this.config.canvas.h - this.config.margin * 2,
    };

    for (const ruleName of ruleNames) {
      const rule = ALL_RULES.find((r) => r.name === ruleName);
      if (rule) {
        result = rule.apply(result, innerCanvas);
      }
    }

    // Snap to baseline grid
    result = result.map((el) => ({
      ...el,
      rect: snapToGrid(el.rect, this.config.baselineGrid),
    }));

    return result;
  }

  autoLayout(
    content: Array<{
      type: LayoutElement["type"];
      role?: string;
      content?: string;
    }>,
  ): LayoutElement[] {
    const innerCanvas: LayoutRect = {
      x: this.config.canvas.x + this.config.margin,
      y: this.config.canvas.y + this.config.margin,
      w: this.config.canvas.w - this.config.margin * 2,
      h: this.config.canvas.h - this.config.margin * 2,
    };

    const elements: LayoutElement[] = content.map((item, i) => {
      const rect = this.estimateRect(item, innerCanvas);
      return {
        id: `el-${i}`,
        type: item.type,
        role: item.role,
        rect,
      };
    });

    // Determine slide type from roles
    const slideType = this.inferSlideType(elements);
    return this.layout(elements, slideType);
  }

  private estimateRect(
    item: { type: LayoutElement["type"]; role?: string; content?: string },
    canvas: LayoutRect,
  ): LayoutRect {
    const lines = item.content ? item.content.split("\n").length : 1;

    switch (item.type) {
      case "text":
        return {
          x: canvas.x,
          y: canvas.y,
          w: canvas.w,
          h: Math.max(0.5, lines * 0.3),
        };
      case "image":
        return {
          x: canvas.x,
          y: canvas.y,
          w: canvas.w * 0.6,
          h: canvas.h * 0.5,
        };
      case "chart":
        return {
          x: canvas.x,
          y: canvas.y,
          w: canvas.w * 0.8,
          h: canvas.h * 0.6,
        };
      case "table":
        return {
          x: canvas.x,
          y: canvas.y,
          w: canvas.w,
          h: Math.max(1.5, lines * 0.35),
        };
      case "shape":
        return { x: canvas.x, y: canvas.y, w: 2, h: 2 };
      case "icon":
        return { x: canvas.x, y: canvas.y, w: 0.5, h: 0.5 };
      default:
        return { x: canvas.x, y: canvas.y, w: canvas.w, h: 1 };
    }
  }

  private inferSlideType(elements: LayoutElement[]): string {
    const hasTitle = elements.some(
      (el) => el.role === "title" || el.role === "heading",
    );
    const hasBody = elements.some((el) => el.role === "body");
    const hasImage = elements.some((el) => el.type === "image");
    const hasChart = elements.some((el) => el.type === "chart");

    if (elements.length === 1 && hasTitle) return "title";
    if (hasChart) return "chart";
    if (hasImage && hasTitle) return "image";
    if (hasTitle && hasBody) return "content";
    if (elements.length >= 3) return "twoColumn";
    return "content";
  }
}
