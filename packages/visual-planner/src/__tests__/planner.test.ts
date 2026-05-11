import { describe, it, expect } from "vitest";
import { analyzeSlide } from "../analyzer";
import { planVisuals } from "../planner";

// ─── Mock Slide factory ───────────────────────────────────────────────
// We build minimal objects that satisfy the Slide interface from
// @opendeck/slide-dsl without importing the type directly.

function makeSlide(overrides: Record<string, unknown> = {}) {
  return {
    id: "slide_1",
    index: 0,
    type: "insight",
    layout: "title_content",
    communicationGoal: "inform",
    mainMessage: "Test slide",
    elements: [],
    ...overrides,
  };
}

function textEl(id: string, content: string) {
  return { id, type: "text", role: "body", content, editable: true };
}

function imageEl(id: string) {
  return {
    id,
    type: "image",
    role: "illustration",
    source: "https://example.com/img.png",
    sourceType: "web",
    editable: false,
  };
}

function chartEl(id: string) {
  return {
    id,
    type: "chart",
    chartType: "bar",
    role: "evidence",
    data: { categories: ["A", "B"], series: [{ name: "S1", values: [10, 20] }] },
    editable: false,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────

describe("analyzeSlide", () => {
  it("suggests an image for a slide with >3 text elements and no image", () => {
    const slide = makeSlide({
      elements: [textEl("t1", "A"), textEl("t2", "B"), textEl("t3", "C"), textEl("t4", "D")],
    });

    const suggestions = analyzeSlide(slide as any);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].type).toBe("image");
    expect(suggestions[0].priority).toBe("medium");
    expect(suggestions[0].rationale).toContain("4 text elements");
  });

  it("suggests a high-priority chart for a data_chart slide without chart", () => {
    const slide = makeSlide({
      id: "slide_data",
      type: "data_chart",
      elements: [textEl("t1", "Revenue overview")],
    });

    const suggestions = analyzeSlide(slide as any);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].type).toBe("chart");
    expect(suggestions[0].priority).toBe("high");
    expect(suggestions[0].targetSlideId).toBe("slide_data");
    expect(suggestions[0].rationale).toContain("data_chart");
  });

  it("suggests a hero image for a cover slide without image", () => {
    const slide = makeSlide({
      id: "slide_cover",
      type: "cover",
      layout: "hero_title",
      elements: [textEl("t1", "Title")],
    });

    const suggestions = analyzeSlide(slide as any);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].type).toBe("image");
    expect(suggestions[0].priority).toBe("high");
    expect(suggestions[0].rationale).toContain("hero");
    expect(suggestions[0].config).toHaveProperty("role", "hero");
  });

  it("suggests a chart when slide has numerical data and no chart", () => {
    const slide = makeSlide({
      elements: [textEl("t1", "Revenue grew 45% this quarter")],
    });

    const suggestions = analyzeSlide(slide as any);

    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    const chartSuggestion = suggestions.find((s) => s.type === "chart");
    expect(chartSuggestion).toBeDefined();
    expect(chartSuggestion!.rationale).toContain("numerical data");
  });

  it("returns no suggestions for a balanced slide", () => {
    const slide = makeSlide({
      elements: [
        textEl("t1", "Title"),
        textEl("t2", "Body text"),
        imageEl("img1"),
      ],
    });

    const suggestions = analyzeSlide(slide as any);

    expect(suggestions).toHaveLength(0);
  });

  it("returns no image suggestion when slide already has an image", () => {
    const slide = makeSlide({
      elements: [
        textEl("t1", "A"),
        textEl("t2", "B"),
        textEl("t3", "C"),
        textEl("t4", "D"),
        imageEl("img1"),
      ],
    });

    const suggestions = analyzeSlide(slide as any);
    const imageSuggestions = suggestions.filter((s) => s.type === "image");

    expect(imageSuggestions).toHaveLength(0);
  });
});

describe("planVisuals", () => {
  it("returns an array of VisualPlan objects", () => {
    const slides = [
      makeSlide({ id: "s1", elements: [textEl("t1", "A"), textEl("t2", "B")] }),
      makeSlide({ id: "s2", type: "cover", elements: [textEl("t3", "Title")] }),
    ];

    const plans = planVisuals(slides as any);

    expect(plans).toHaveLength(2);
    expect(plans[0].slideId).toBe("s1");
    expect(plans[1].slideId).toBe("s2");
    expect(plans[1].suggestions.length).toBeGreaterThan(0);
  });

  it("computes imageCount and chartCount including suggestions", () => {
    const slides = [
      makeSlide({
        id: "s1",
        elements: [
          textEl("t1", "A"),
          textEl("t2", "B"),
          textEl("t3", "C"),
          textEl("t4", "D"),
        ],
      }),
    ];

    const plans = planVisuals(slides as any);

    expect(plans[0].imageCount).toBe(1); // suggested image
    expect(plans[0].chartCount).toBe(0);
  });

  it("sets hasVisualBalance to true when suggestions fix imbalance", () => {
    const slides = [
      makeSlide({
        id: "s1",
        elements: [
          textEl("t1", "A"),
          textEl("t2", "B"),
          textEl("t3", "C"),
          textEl("t4", "D"),
        ],
      }),
    ];

    const plans = planVisuals(slides as any);

    // 4 text elements + 1 suggested image → textCount > 4 is false after suggestion? No.
    // hasVisualBalance checks textCount (existing) <= 4 AND totalImages + totalCharts > 0
    // textCount = 4, which is <= 4, and we have 1 suggested image → balanced
    expect(plans[0].hasVisualBalance).toBe(true);
  });

  it("returns empty suggestions for slides that need nothing", () => {
    const slides = [
      makeSlide({
        id: "s1",
        elements: [textEl("t1", "Title"), imageEl("img1")],
      }),
    ];

    const plans = planVisuals(slides as any);

    expect(plans[0].suggestions).toHaveLength(0);
    expect(plans[0].hasVisualBalance).toBe(true);
  });
});
