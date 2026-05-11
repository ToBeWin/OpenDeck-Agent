import { describe, it, expect } from "vitest";
import type { Deck, ThemeSpec } from "@opendeck/slide-dsl";
import { applyRevision, applyRevisions } from "../patcher";
import type { RevisionAction } from "../types";

// ─── Minimal test deck fixture ────────────────────────────────────────────

function makeTheme(): ThemeSpec {
  return {
    id: "theme-1",
    name: "default",
    style: "apple_keynote",
    colors: {
      primary: "#007AFF",
      secondary: "#5856D6",
      accent: "#FF9500",
      background: "#FFFFFF",
      surface: "#F2F2F7",
      textPrimary: "#000000",
      textSecondary: "#3C3C43",
      textInverse: "#FFFFFF",
      border: "#C6C6C8",
      success: "#34C759",
      warning: "#FF9F0A",
      error: "#FF3B30",
      chartColors: ["#007AFF", "#FF9500", "#34C759"],
    },
    typography: {
      titleFont: "SF Pro Display",
      bodyFont: "SF Pro Text",
      monoFont: "SF Mono",
      titleSize: 36,
      subtitleSize: 24,
      bodySize: 16,
      captionSize: 12,
      titleWeight: "bold",
      bodyWeight: "regular",
      lineHeight: 1.4,
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
      lineColor: "#C6C6C8",
    },
    chart: {
      axisColor: "#8E8E93",
      gridColor: "#E5E5EA",
      labelColor: "#3C3C43",
      fontFamily: "SF Pro Text",
    },
    image: {
      borderRadius: 8,
      overlayOpacity: 0.3,
      overlayColor: "#000000",
    },
    density: "medium",
    defaultVisualIntensity: "medium",
  };
}

function makeDeck(): Deck {
  return {
    id: "deck-1",
    title: "Test Deck",
    language: "en",
    aspectRatio: "16:9",
    purpose: "custom",
    theme: makeTheme(),
    slides: [
      {
        id: "s1",
        index: 0,
        type: "cover",
        layout: "hero_title",
        communicationGoal: "Introduce the deck",
        mainMessage: "Welcome",
        elements: [
          {
            id: "el-title",
            type: "text",
            role: "title",
            content: "Welcome",
            editable: true,
          },
        ],
      },
      {
        id: "s2",
        index: 1,
        type: "insight",
        layout: "title_content",
        communicationGoal: "Show key insight",
        mainMessage: "Key Insight",
        elements: [
          {
            id: "el-body",
            type: "text",
            role: "body",
            content: "Body text",
            editable: true,
          },
        ],
      },
      {
        id: "s3",
        index: 2,
        type: "closing",
        layout: "title_content",
        communicationGoal: "Wrap up",
        mainMessage: "Thank you",
        elements: [],
      },
    ],
    metadata: { createdAt: "2026-01-01T00:00:00Z", version: "0.1.0" },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("applyRevision", () => {
  it("add_slide inserts at the specified index", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "add_slide",
      index: 1,
      slide: { type: "problem", layout: "two_column" },
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides).toHaveLength(4);
    expect(d.slides[1].type).toBe("problem");
    expect(d.slides[1].layout).toBe("two_column");
    // Verify re-indexing
    expect(d.slides.map((s) => s.index)).toEqual([0, 1, 2, 3]);
  });

  it("add_slide appends when index is omitted", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "add_slide",
      slide: { type: "summary", layout: "title_content" },
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides).toHaveLength(4);
    expect(d.slides[3].type).toBe("summary");
  });

  it("add_slide rejects out-of-range index", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "add_slide",
      index: 99,
      slide: { type: "insight", layout: "title_content" },
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("remove_slide removes the correct slide", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, { action: "remove_slide", index: 1 });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides).toHaveLength(2);
    expect(d.slides[0].type).toBe("cover");
    expect(d.slides[1].type).toBe("closing");
    expect(d.slides.map((s) => s.index)).toEqual([0, 1]);
  });

  it("remove_slide rejects out-of-range index", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, { action: "remove_slide", index: 10 });
    expect(result.success).toBe(false);
  });

  it("move_slide reorders slides correctly", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "move_slide",
      from: 0,
      to: 2,
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides[0].type).toBe("insight");
    expect(d.slides[1].type).toBe("closing");
    expect(d.slides[2].type).toBe("cover");
    expect(d.slides.map((s) => s.index)).toEqual([0, 1, 2]);
  });

  it("move_slide rejects out-of-range indices", () => {
    const deck = makeDeck();
    expect(
      applyRevision(deck, { action: "move_slide", from: -1, to: 0 }).success,
    ).toBe(false);
    expect(
      applyRevision(deck, { action: "move_slide", from: 0, to: 99 }).success,
    ).toBe(false);
  });

  it("update_slide merges patch into slide properties", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "update_slide",
      index: 0,
      patch: { mainMessage: "Updated message", speakerNote: "A note" },
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides[0].mainMessage).toBe("Updated message");
    expect(d.slides[0].speakerNote).toBe("A note");
  });

  it("update_slide rejects out-of-range index", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "update_slide",
      index: 99,
      patch: {},
    });
    expect(result.success).toBe(false);
  });

  it("add_element adds element to the correct slide", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "add_element",
      slideIndex: 2,
      element: {
        id: "el-new",
        type: "text",
        role: "body",
        content: "New element",
        editable: true,
      },
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides[2].elements).toHaveLength(1);
    expect(d.slides[2].elements[0].id).toBe("el-new");
  });

  it("add_element rejects out-of-range slideIndex", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "add_element",
      slideIndex: 99,
      element: { id: "x", type: "text" },
    });
    expect(result.success).toBe(false);
  });

  it("remove_element removes element by ID", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "remove_element",
      slideIndex: 0,
      elementId: "el-title",
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.slides[0].elements).toHaveLength(0);
  });

  it("remove_element rejects unknown element ID", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "remove_element",
      slideIndex: 0,
      elementId: "nonexistent",
    });
    expect(result.success).toBe(false);
  });

  it("update_element merges patch into element properties", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "update_element",
      slideIndex: 0,
      elementId: "el-title",
      patch: { content: "Updated Title" },
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    const el = d.slides[0].elements.find((e) => e.id === "el-title");
    expect(el).toBeDefined();
    expect((el as Record<string, unknown>).content).toBe("Updated Title");
  });

  it("change_theme updates the deck theme name", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "change_theme",
      theme: "dark",
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.theme.name).toBe("dark");
  });

  it("change_title updates the deck title", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "change_title",
      title: "New Title",
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.title).toBe("New Title");
  });

  it("change_language updates the deck language", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "change_language",
      language: "zh",
    });
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.language).toBe("zh");
  });

  it("change_language rejects invalid language", () => {
    const deck = makeDeck();
    const result = applyRevision(deck, {
      action: "change_language",
      language: "fr",
    });
    expect(result.success).toBe(false);
  });

  it("does not mutate the original deck", () => {
    const deck = makeDeck();
    const originalLength = deck.slides.length;
    applyRevision(deck, {
      action: "add_slide",
      slide: { type: "insight", layout: "title_content" },
    });
    expect(deck.slides.length).toBe(originalLength);
  });
});

describe("applyRevisions", () => {
  it("applies multiple actions in sequence", () => {
    const deck = makeDeck();
    const actions: RevisionAction[] = [
      { action: "change_title", title: "Revised Deck" },
      {
        action: "add_slide",
        index: 1,
        slide: { type: "problem", layout: "two_column" },
      },
      { action: "remove_slide", index: 2 },
    ];
    const result = applyRevisions(deck, actions);
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.title).toBe("Revised Deck");
    // Original 3 slides, +1 added, -1 removed = 3
    expect(d.slides).toHaveLength(3);
    expect(d.slides[1].type).toBe("problem");
  });

  it("stops and returns error when an action fails", () => {
    const deck = makeDeck();
    const actions: RevisionAction[] = [
      { action: "change_title", title: "Good So Far" },
      { action: "remove_slide", index: 99 }, // invalid
      { action: "change_title", title: "Should Not Reach" },
    ];
    const result = applyRevisions(deck, actions);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("returns the original deck unchanged when given an empty action list", () => {
    const deck = makeDeck();
    const result = applyRevisions(deck, []);
    expect(result.success).toBe(true);
    const d = result.deck as Deck;
    expect(d.title).toBe(deck.title);
    expect(d.slides).toHaveLength(3);
  });
});
