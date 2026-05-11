import { describe, it, expect } from "vitest";
import { parseText } from "../text";

describe("parseText", () => {
  it("first line becomes title", () => {
    const text = "My Presentation Title\n\nParagraph one.\n\nParagraph two.";
    const doc = parseText(text);
    expect(doc.title).toBe("My Presentation Title");
    expect(doc.sections).toHaveLength(2);
  });

  it("paragraphs become sections", () => {
    const text = "Title\n\nFirst paragraph content.\n\nSecond paragraph content.";
    const doc = parseText(text);
    expect(doc.sections[0].content).toBe("First paragraph content.");
    expect(doc.sections[1].content).toBe("Second paragraph content.");
  });

  it("word count is accurate", () => {
    const text = "Title\n\nOne two three four five.";
    const doc = parseText(text);
    expect(doc.metadata.totalWords).toBe(6); // Title + 5 words
    expect(doc.sections[0].metadata.wordCount).toBe(5);
  });

  it("long first line is not treated as title", () => {
    const longLine = "A".repeat(100);
    const text = `${longLine}\n\nSecond paragraph.`;
    const doc = parseText(text);
    // Long line should not be a title
    expect(doc.title).toBe("");
    expect(doc.sections.length).toBeGreaterThanOrEqual(1);
  });

  it("first line ending with period is not a title", () => {
    const text = "This is a sentence.\n\nSecond paragraph.";
    const doc = parseText(text);
    expect(doc.title).toBe("");
  });

  it("empty content returns empty document", () => {
    const doc = parseText("");
    expect(doc.title).toBe("");
    expect(doc.sections).toHaveLength(0);
    expect(doc.metadata.totalWords).toBe(0);
  });

  it("tracks metadata format as text", () => {
    const text = "Title\n\nSome content.";
    const doc = parseText(text);
    expect(doc.metadata.format).toBe("text");
    expect(doc.metadata.totalSections).toBe(1);
  });
});
