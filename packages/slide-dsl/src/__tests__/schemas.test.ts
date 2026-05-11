import { describe, it, expect } from "vitest";
import {
  deckSchema,
  slideElementSchema,
  textElementSchema,
  tableElementSchema,
  chartElementSchema,
} from "../schemas";

// ─── Helpers ──────────────────────────────────────────────────────────

const validTheme = {
  id: "theme_1",
  name: "Default",
  style: "bloomberg_dark" as const,
  colors: {
    primary: "#0066CC",
    secondary: "#4A90D9",
    accent: "#FF6B35",
    background: "#1A1A2E",
    surface: "#16213E",
    textPrimary: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textInverse: "#000000",
    border: "#2A2A4A",
    success: "#00C853",
    warning: "#FFD600",
    error: "#FF1744",
    chartColors: ["#0066CC", "#FF6B35", "#00C853", "#FFD600"],
  },
  typography: {
    titleFont: "Inter",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    titleSize: 36,
    subtitleSize: 24,
    bodySize: 16,
    captionSize: 12,
    titleWeight: "bold",
    bodyWeight: "normal",
    lineHeight: 1.5,
  },
  spacing: {
    slidePaddingX: 60,
    slidePaddingY: 40,
    elementGap: 20,
    sectionGap: 40,
  },
  shapes: {
    cornerRadius: 8,
    lineWidth: 1,
    lineColor: "#2A2A4A",
  },
  chart: {
    axisColor: "#666666",
    gridColor: "#2A2A4A",
    labelColor: "#B0B0B0",
    fontFamily: "Inter",
  },
  image: {
    borderRadius: 8,
    overlayOpacity: 0.3,
    overlayColor: "#000000",
  },
  density: "medium" as const,
  defaultVisualIntensity: "medium" as const,
};

const validMetadata = {
  createdAt: "2025-01-01T00:00:00Z",
  version: "1.0",
};

function makeDeck(overrides: Record<string, unknown> = {}) {
  return {
    id: "deck_1",
    title: "Test Deck",
    language: "zh",
    aspectRatio: "16:9",
    purpose: "business_report",
    theme: validTheme,
    slides: [],
    metadata: validMetadata,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────

describe("deckSchema", () => {
  it("1. A minimal valid deck passes deckSchema.parse()", () => {
    const deck = makeDeck();
    expect(() => deckSchema.parse(deck)).not.toThrow();
    const result = deckSchema.parse(deck);
    expect(result.id).toBe("deck_1");
    expect(result.slides).toEqual([]);
  });

  it("2. A slide with text elements validates", () => {
    const deck = makeDeck({
      slides: [
        {
          id: "slide_1",
          index: 0,
          type: "cover",
          layout: "hero_title",
          communicationGoal: "Introduce the topic",
          mainMessage: "Welcome to the presentation",
          elements: [
            {
              id: "el_title",
              type: "text",
              role: "title",
              content: "Hello World",
              editable: true,
            },
            {
              id: "el_subtitle",
              type: "text",
              role: "subtitle",
              content: "A subtitle",
              editable: true,
            },
          ],
        },
      ],
    });
    const result = deckSchema.parse(deck);
    expect(result.slides).toHaveLength(1);
    expect(result.slides[0].elements).toHaveLength(2);
  });

  it("3. A slide with table element validates", () => {
    const deck = makeDeck({
      slides: [
        {
          id: "slide_1",
          index: 0,
          type: "comparison",
          layout: "comparison_matrix",
          communicationGoal: "Compare options",
          mainMessage: "Here is a comparison",
          elements: [
            {
              id: "el_table",
              type: "table",
              role: "comparison",
              headers: ["Feature", "A", "B"],
              rows: [
                ["Speed", "Fast", "Slow"],
                ["Cost", "Low", "High"],
              ],
              editable: true,
            },
          ],
        },
      ],
    });
    const result = deckSchema.parse(deck);
    const tableEl = result.slides[0].elements[0];
    expect(tableEl.type).toBe("table");
    if (tableEl.type === "table") {
      expect(tableEl.headers).toHaveLength(3);
      expect(tableEl.rows).toHaveLength(2);
    }
  });

  it("4. A slide with chart element validates", () => {
    const deck = makeDeck({
      slides: [
        {
          id: "slide_1",
          index: 0,
          type: "data_chart",
          layout: "chart_focus",
          communicationGoal: "Show data trends",
          mainMessage: "Revenue is growing",
          elements: [
            {
              id: "el_chart",
              type: "chart",
              chartType: "bar",
              role: "trend",
              data: {
                categories: ["Q1", "Q2", "Q3", "Q4"],
                series: [
                  { name: "Revenue", values: [10, 20, 30, 40] },
                ],
              },
              editable: true,
            },
          ],
        },
      ],
    });
    const result = deckSchema.parse(deck);
    const chartEl = result.slides[0].elements[0];
    expect(chartEl.type).toBe("chart");
    if (chartEl.type === "chart") {
      expect(chartEl.chartType).toBe("bar");
      expect(chartEl.data.categories).toEqual(["Q1", "Q2", "Q3", "Q4"]);
    }
  });

  it("5. Missing required fields produce ZodError", () => {
    // Missing title
    const incomplete = {
      id: "deck_1",
      language: "zh",
      aspectRatio: "16:9",
      purpose: "business_report",
      theme: validTheme,
      slides: [],
      metadata: validMetadata,
    };
    const result = deckSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
    if (!result.success) {
      const titleIssue = result.error.issues.find((i) =>
        i.path.includes("title")
      );
      expect(titleIssue).toBeDefined();
    }
  });

  it("6. An element with unknown type is rejected", () => {
    const deck = makeDeck({
      slides: [
        {
          id: "slide_1",
          index: 0,
          type: "cover",
          layout: "hero_title",
          communicationGoal: "Introduce",
          mainMessage: "Hello",
          elements: [
            {
              id: "el_bad",
              type: "unknown_type",
              content: "bad",
            },
          ],
        },
      ],
    });
    const result = deckSchema.safeParse(deck);
    expect(result.success).toBe(false);
    if (!result.success) {
      const typeIssue = result.error.issues.find(
        (i) =>
          i.message.includes("type") ||
          i.message.includes("invalid") ||
          i.message.includes("discriminator")
      );
      expect(typeIssue).toBeDefined();
    }
  });

  it("7. slideElementSchema discriminates correctly on type", () => {
    const textEl = {
      id: "el_1",
      type: "text",
      role: "title",
      content: "Hello",
      editable: true,
    };
    const textResult = slideElementSchema.parse(textEl);
    expect(textResult.type).toBe("text");

    const imageEl = {
      id: "el_2",
      type: "image",
      role: "hero",
      source: "https://example.com/img.png",
      sourceType: "web",
      editable: false,
    };
    const imageResult = slideElementSchema.parse(imageEl);
    expect(imageResult.type).toBe("image");

    const shapeEl = {
      id: "el_3",
      type: "shape",
      shapeType: "rectangle",
    };
    const shapeResult = slideElementSchema.parse(shapeEl);
    expect(shapeResult.type).toBe("shape");

    const iconEl = {
      id: "el_4",
      type: "icon",
      iconType: "check",
    };
    const iconResult = slideElementSchema.parse(iconEl);
    expect(iconResult.type).toBe("icon");

    // Verify that type field is correctly narrowed
    const parsed = slideElementSchema.parse(textEl);
    if (parsed.type === "text") {
      expect(parsed.content).toBe("Hello");
      expect(parsed.role).toBe("title");
    }
  });
});
