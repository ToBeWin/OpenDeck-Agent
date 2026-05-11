import { describe, it, expect } from "vitest";
import { scoreDeck, scoreSlideCheck } from "../checker";
import type { Deck, Slide } from "@opendeck/slide-dsl";

function makeSlide(overrides: Partial<Slide> = {}): Slide {
  return {
    id: "slide-1",
    index: 0,
    type: "content",
    layout: "default",
    mainMessage: "Test message",
    communicationGoal: "Inform",
    elements: [
      {
        id: "title-1",
        type: "text",
        role: "title",
        content: "Q2 Revenue Analysis",
        editable: true,
        box: { x: 0, y: 0, w: 100, h: 10 },
      },
    ],
    ...overrides,
  };
}

function makeDeck(slides: Slide[] = [makeSlide()]): Deck {
  return {
    title: "Test Deck",
    purpose: "presentation",
    audience: "general",
    language: "en",
    aspectRatio: "16:9",
    theme: { style: "light" },
    slides,
  };
}

describe("scoreSlideCheck", () => {
  it("returns high score for a well-formed slide", () => {
    const score = scoreSlideCheck(makeSlide());
    expect(score.overall).toBeGreaterThanOrEqual(80);
    expect(score.issues).toHaveLength(0);
  });

  it("warns when slide has no main message", () => {
    const score = scoreSlideCheck(makeSlide({ mainMessage: "" }));
    const issues = score.issues.filter((i) => i.message.includes("main message"));
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
  });

  it("warns when slide has no title element", () => {
    const score = scoreSlideCheck(makeSlide({ elements: [] }));
    const issues = score.issues.filter((i) => i.message.includes("title element"));
    expect(issues).toHaveLength(1);
  });

  it("warns for generic titles", () => {
    const score = scoreSlideCheck(
      makeSlide({
        elements: [
          {
            id: "t1",
            type: "text",
            role: "title",
            content: "Untitled",
            editable: true,
            box: { x: 0, y: 0, w: 100, h: 10 },
          },
        ],
      })
    );
    const issues = score.issues.filter((i) => i.message.includes("Generic title"));
    expect(issues).toHaveLength(1);
  });

  it("warns for too-short titles", () => {
    const score = scoreSlideCheck(
      makeSlide({
        elements: [
          {
            id: "t1",
            type: "text",
            role: "title",
            content: "Hi",
            editable: true,
            box: { x: 0, y: 0, w: 100, h: 10 },
          },
        ],
      })
    );
    const issues = score.issues.filter((i) => i.message.includes("too short"));
    expect(issues).toHaveLength(1);
  });

  it("warns for overcrowded slides", () => {
    const elements = Array.from({ length: 10 }, (_, i) => ({
      id: `text-${i}`,
      type: "text" as const,
      role: "body" as const,
      content: `Content ${i}`,
      editable: true,
      box: { x: 0, y: i * 10, w: 100, h: 8 },
    }));
    const score = scoreSlideCheck(makeSlide({ elements }));
    const issues = score.issues.filter((i) => i.message.includes("overcrowded"));
    expect(issues).toHaveLength(1);
  });

  it("errors for non-editable text elements", () => {
    const score = scoreSlideCheck(
      makeSlide({
        elements: [
          {
            id: "t1",
            type: "text",
            role: "body",
            content: "Locked",
            editable: false,
            box: { x: 0, y: 0, w: 100, h: 10 },
          },
        ],
      })
    );
    const issues = score.issues.filter((i) => i.message.includes("not editable"));
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("error");
  });

  it("info for content-heavy slide with no visuals", () => {
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: `text-${i}`,
      type: "text" as const,
      role: "body" as const,
      content: `Content paragraph ${i} with enough text to be meaningful.`,
      editable: true,
      box: { x: 0, y: i * 12, w: 100, h: 10 },
    }));
    const score = scoreSlideCheck(makeSlide({ elements }));
    const issues = score.issues.filter((i) => i.message.includes("no visual elements"));
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("info");
  });
});

describe("scoreDeck", () => {
  it("returns high score for a well-formed deck", () => {
    const deck = makeDeck([
      makeSlide({ id: "s1", index: 0, type: "cover" }),
      makeSlide({ id: "s2", index: 1, type: "content" }),
      makeSlide({ id: "s3", index: 2, type: "closing" }),
    ]);
    const score = scoreDeck(deck);
    expect(score.overall).toBeGreaterThanOrEqual(70);
    expect(score.slides).toHaveLength(3);
  });

  it("errors for empty deck", () => {
    const score = scoreDeck(makeDeck([]));
    const issues = score.issues.filter((i) => i.message.includes("no slides"));
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("error");
  });

  it("warns for multiple cover slides", () => {
    const deck = makeDeck([
      makeSlide({ id: "s1", index: 0, type: "cover" }),
      makeSlide({ id: "s2", index: 1, type: "cover" }),
      makeSlide({ id: "s3", index: 2, type: "content" }),
    ]);
    const score = scoreDeck(deck);
    const issues = score.issues.filter((i) => i.message.includes("cover slides"));
    expect(issues).toHaveLength(1);
  });

  it("warns for slide index mismatch", () => {
    const deck = makeDeck([
      makeSlide({ id: "s1", index: 0 }),
      makeSlide({ id: "s2", index: 5 }), // wrong index
    ]);
    const score = scoreDeck(deck);
    const issues = score.issues.filter((i) => i.message.includes("index mismatch"));
    expect(issues).toHaveLength(1);
  });

  it("warns when language is not set", () => {
    const deck = makeDeck();
    deck.language = undefined as any;
    const score = scoreDeck(deck);
    const issues = score.issues.filter((i) => i.message.includes("language"));
    expect(issues).toHaveLength(1);
  });

  it("returns summary string", () => {
    const score = scoreDeck(makeDeck());
    expect(score.summary).toBeDefined();
    expect(typeof score.summary).toBe("string");
  });

  it("computes sub-scores", () => {
    const score = scoreDeck(makeDeck());
    expect(score.content).toBeGreaterThanOrEqual(0);
    expect(score.logic).toBeGreaterThanOrEqual(0);
    expect(score.visual).toBeGreaterThanOrEqual(0);
    expect(score.editability).toBeGreaterThanOrEqual(0);
    expect(score.consistency).toBeGreaterThanOrEqual(0);
    expect(score.compatibility).toBeGreaterThanOrEqual(0);
  });
});
