import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { TextModelProvider } from "@opendeck/model-providers";
import { generateDeck } from "../pipeline";

/**
 * Creates a mock provider that returns deterministic, schema-valid responses
 * for each step of the pipeline: intent -> deck plan -> slide DSL (per slide).
 */
function createPipelineMockProvider(slideCount: number): TextModelProvider {
  let callIndex = 0;

  // Pre-build the slide responses
  const slideResponses: string[] = [];
  for (let i = 0; i < slideCount; i++) {
    slideResponses.push(
      JSON.stringify({
        id: `slide_${i}`,
        index: i,
        type: i === 0 ? "cover" : i === slideCount - 1 ? "closing" : "insight",
        layout: i === 0 ? "hero_title" : "title_content",
        communicationGoal: `Goal for slide ${i}`,
        mainMessage: `Message for slide ${i}`,
        elements: [
          {
            id: `title_${i}`,
            type: "text",
            role: "title",
            content: `Title ${i}`,
            editable: true,
          },
          {
            id: `body_${i}`,
            type: "text",
            role: "body",
            content: `Body content for slide ${i}`,
            editable: true,
          },
        ],
        speakerNote: `Speaker note for slide ${i}`,
      })
    );
  }

  const responses = [
    // 1. Intent response
    JSON.stringify({
      intent: "generate_deck",
      confidence: 0.95,
      parameters: { purpose: "business_report" },
    }),
    // 2. Deck plan response
    JSON.stringify({
      title: "Test Presentation",
      purpose: "business_report",
      audience: "general",
      language: "zh",
      slideCount,
      slides: Array.from({ length: slideCount }, (_, i) => ({
        index: i,
        type:
          i === 0
            ? "cover"
            : i === slideCount - 1
              ? "closing"
              : "insight",
        layout: i === 0 ? "hero_title" : "title_content",
        communicationGoal: `Goal for slide ${i}`,
        mainMessage: `Message for slide ${i}`,
        keyPoints: [`Point A for ${i}`, `Point B for ${i}`],
      })),
      theme: "bloomberg_dark",
    }),
    // 3+. Slide DSL responses
    ...slideResponses,
  ];

  return {
    id: "pipeline-mock",
    name: "Pipeline Mock",
    type: "local",
    async complete(req) {
      const response = responses[callIndex] ?? '{"error": "no more responses"}';
      callIndex++;
      return {
        content: response,
        usage: { inputTokens: 100, outputTokens: 200 },
        finishReason: "stop",
      };
    },
  };
}

describe("generateDeck pipeline", () => {
  it("returns a valid Deck with mock provider", async () => {
    const slideCount = 5;
    const provider = createPipelineMockProvider(slideCount);

    const deck = await generateDeck({
      prompt: "Create a presentation about AI trends",
      provider,
    });

    expect(deck).toBeDefined();
    expect(deck.title).toBe("Test Presentation");
    expect(deck.slides).toHaveLength(slideCount);
    expect(deck.language).toBe("zh");
    expect(deck.theme).toBeDefined();
    expect(deck.theme.id).toBeTruthy();
    expect(deck.theme.colors).toBeDefined();
    expect(deck.theme.typography).toBeDefined();
    expect(deck.metadata).toBeDefined();
    expect(deck.metadata.createdAt).toBeTruthy();
    expect(deck.metadata.version).toBeTruthy();
  });

  it("generated deck has the requested number of slides", async () => {
    const slideCount = 3;
    const provider = createPipelineMockProvider(slideCount);

    const deck = await generateDeck({
      prompt: "Three-slide test",
      slideCount,
      provider,
    });

    expect(deck.slides).toHaveLength(slideCount);
    // Verify slide indices are sequential
    deck.slides.forEach((slide, i) => {
      expect(slide.index).toBe(i);
    });
  });

  it("generated deck has valid slide structure", async () => {
    const slideCount = 2;
    const provider = createPipelineMockProvider(slideCount);

    const deck = await generateDeck({
      prompt: "Two-slide test",
      slideCount,
      provider,
    });

    for (const slide of deck.slides) {
      expect(slide.id).toBeTruthy();
      expect(slide.type).toBeTruthy();
      expect(slide.layout).toBeTruthy();
      expect(slide.communicationGoal).toBeTruthy();
      expect(slide.mainMessage).toBeTruthy();
      expect(slide.elements).toBeDefined();
      expect(slide.elements.length).toBeGreaterThan(0);

      // Verify text elements have required fields
      for (const el of slide.elements) {
        if (el.type === "text") {
          expect(el.id).toBeTruthy();
          expect(el.role).toBeTruthy();
          expect(el.content).toBeTruthy();
          expect(el.editable).toBe(true);
        }
      }
    }
  });

  it("respects custom options", async () => {
    const provider = createPipelineMockProvider(4);

    const deck = await generateDeck({
      prompt: "Custom test",
      purpose: "startup_pitch",
      audience: "investors",
      language: "en",
      slideCount: 4,
      theme: "apple_keynote",
      provider,
    });

    expect(deck.language).toBe("zh"); // From mock plan response
    expect(deck.slides).toHaveLength(4);
  });
});
