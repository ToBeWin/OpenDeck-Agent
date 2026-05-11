import { describe, it, expect } from "vitest";
import {
  buildIntentPrompt,
  buildDeckPlanPrompt,
  buildSlidePrompt,
  buildRevisionPrompt,
} from "../prompt-builder";

describe("buildIntentPrompt", () => {
  it("returns non-empty string containing the user message", () => {
    const result = buildIntentPrompt("Create a deck about AI trends");
    expect(result.systemPrompt).toBeTruthy();
    expect(result.userPrompt).toBeTruthy();
    expect(result.userPrompt).toContain("Create a deck about AI trends");
  });

  it("includes project state when provided", () => {
    const result = buildIntentPrompt("Add a new slide", {
      title: "My Deck",
      slideCount: 5,
      theme: "bloomberg_dark",
    });
    expect(result.userPrompt).toContain("My Deck");
    expect(result.userPrompt).toContain("5");
    expect(result.userPrompt).toContain("bloomberg_dark");
  });

  it("system prompt describes supported intents", () => {
    const result = buildIntentPrompt("test");
    expect(result.systemPrompt).toContain("generate_deck");
    expect(result.systemPrompt).toContain("modify_slide");
    expect(result.systemPrompt).toContain("change_style");
  });
});

describe("buildDeckPlanPrompt", () => {
  it("includes purpose and audience", () => {
    const result = buildDeckPlanPrompt(
      "AI in Healthcare",
      "business_report",
      "executives",
      10
    );
    expect(result.systemPrompt).toBeTruthy();
    expect(result.userPrompt).toContain("AI in Healthcare");
    expect(result.userPrompt).toContain("business_report");
    expect(result.userPrompt).toContain("executives");
    expect(result.userPrompt).toContain("10");
  });

  it("system prompt describes slide types and layouts", () => {
    const result = buildDeckPlanPrompt("test", "test", "test", 5);
    expect(result.systemPrompt).toContain("cover");
    expect(result.systemPrompt).toContain("insight");
    expect(result.systemPrompt).toContain("hero_title");
    expect(result.systemPrompt).toContain("two_column");
  });
});

describe("buildSlidePrompt", () => {
  it("includes slide type and layout", () => {
    const result = buildSlidePrompt({
      index: 0,
      type: "cover",
      layout: "hero_title",
      communicationGoal: "Introduce the topic",
      mainMessage: "Welcome",
      keyPoints: ["Point 1", "Point 2"],
    });
    expect(result.systemPrompt).toBeTruthy();
    expect(result.userPrompt).toContain("cover");
    expect(result.userPrompt).toContain("hero_title");
    expect(result.userPrompt).toContain("Introduce the topic");
    expect(result.userPrompt).toContain("Welcome");
  });

  it("includes theme spec when provided", () => {
    const result = buildSlidePrompt(
      {
        index: 1,
        type: "insight",
        layout: "title_content",
        communicationGoal: "Share key insight",
        mainMessage: "Key finding",
        keyPoints: ["Detail 1"],
      },
      {
        id: "theme_test",
        name: "Test Theme",
        style: "bloomberg_dark",
      }
    );
    expect(result.userPrompt).toContain("bloomberg_dark");
    expect(result.userPrompt).toContain("theme_test");
  });
});

describe("buildRevisionPrompt", () => {
  it("includes current slide and user command", () => {
    const slide = {
      id: "slide_1",
      type: "insight",
      elements: [{ id: "el_1", type: "text", content: "Old text" }],
    };
    const result = buildRevisionPrompt(slide, "Change the title to New Title");
    expect(result.systemPrompt).toBeTruthy();
    expect(result.userPrompt).toContain("Old text");
    expect(result.userPrompt).toContain("Change the title to New Title");
  });
});
