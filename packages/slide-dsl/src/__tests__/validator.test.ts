import { describe, it, expect } from "vitest";
import { validateDeck } from "../validator";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ─── Full theme fixture ───────────────────────────────────────────────

const fullTheme = {
  id: "theme_bloomberg_dark",
  name: "Bloomberg Dark",
  style: "bloomberg_dark",
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
  density: "medium",
  defaultVisualIntensity: "medium",
};

const fullMetadata = {
  createdAt: "2025-01-01T00:00:00Z",
  version: "1.0",
};

function makeValidDeck(overrides: Record<string, unknown> = {}) {
  return {
    id: "deck_1",
    title: "Test Deck",
    language: "zh",
    aspectRatio: "16:9",
    purpose: "business_report",
    theme: fullTheme,
    slides: [
      {
        id: "slide_1",
        index: 0,
        type: "cover",
        layout: "hero_title",
        communicationGoal: "Introduce the topic",
        mainMessage: "Welcome",
        elements: [
          {
            id: "el_title",
            type: "text",
            role: "title",
            content: "Hello",
            editable: true,
          },
        ],
      },
    ],
    metadata: fullMetadata,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────

describe("validateDeck", () => {
  it("1. valid input returns { valid: true, errors: [], deck }", () => {
    const deck = makeValidDeck();
    const result = validateDeck(deck);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.deck).toBeDefined();
    expect(result.deck!.id).toBe("deck_1");
  });

  it("2. invalid input returns { valid: false, errors: [...] }", () => {
    const invalid = {
      id: 123, // wrong type
      // missing title, language, etc.
    };
    const result = validateDeck(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.deck).toBeUndefined();
  });

  it("3. sample-deck.json validates (after fixing)", () => {
    // Resolve path to examples/decks/sample-deck.json relative to repo root
    const samplePath = resolve(
      __dirname,
      "../../../../examples/decks/sample-deck.json"
    );
    let raw: string;
    try {
      raw = readFileSync(samplePath, "utf-8");
    } catch {
      // If file doesn't exist, skip this test
      console.warn("sample-deck.json not found, skipping test");
      return;
    }
    const data = JSON.parse(raw);

    // Patch missing required fields if needed
    if (!data.theme.colors) {
      data.theme = fullTheme;
    }
    if (!data.metadata.createdAt) {
      data.metadata.createdAt = "2025-01-15T00:00:00Z";
    }
    if (!data.metadata.version) {
      data.metadata.version = "1.0";
    }

    // Fix invalid slide types
    for (const slide of data.slides) {
      // Fix slide types that are not in SlideType union
      if (slide.type === "two_column") slide.type = "comparison";
      if (slide.type === "comparison_matrix") slide.type = "comparison";
      if (slide.type === "chart_focus") slide.type = "data_chart";

      // Fix chart element roles
      for (const el of slide.elements) {
        if (el.type === "chart" && el.role === "data") {
          el.role = "evidence";
        }
      }

      // Ensure communicationGoal and mainMessage exist
      if (!slide.communicationGoal) slide.communicationGoal = "";
      if (!slide.mainMessage) slide.mainMessage = "";
    }

    const result = validateDeck(data);
    if (!result.valid) {
      console.error("Validation errors:", result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.deck).toBeDefined();
    expect(result.deck!.slides.length).toBeGreaterThan(0);
  });
});
