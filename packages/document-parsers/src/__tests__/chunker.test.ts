import { describe, it, expect } from "vitest";
import { documentToSlides } from "../chunker";
import { parseMarkdown } from "../markdown";
import type { ParsedDocument } from "../types";

describe("documentToSlides", () => {
  it("short document becomes single slide", () => {
    const doc = parseMarkdown(`## Intro

This is a short section with just a few words.`);
    const slides = documentToSlides(doc);
    expect(slides).toHaveLength(1);
    expect(slides[0].title).toBe("Intro");
  });

  it("multiple sections become multiple slides", () => {
    const doc = parseMarkdown(`## First

Content one.

## Second

Content two.

## Third

Content three.`);
    const slides = documentToSlides(doc);
    expect(slides).toHaveLength(3);
    expect(slides[0].title).toBe("First");
    expect(slides[1].title).toBe("Second");
    expect(slides[2].title).toBe("Third");
  });

  it("long section gets split", () => {
    // Create a section with > 100 words
    const words = Array.from({ length: 150 }, (_, i) => `word${i}`).join(" ");
    const doc: ParsedDocument = {
      title: "Test",
      sections: [
        {
          id: "s1",
          title: "Long Section",
          level: 1,
          content: words,
          children: [],
          metadata: { startIndex: 0, endIndex: words.length, wordCount: 150 },
        },
      ],
      metadata: { format: "markdown", totalWords: 150, totalSections: 1, headings: [] },
    };
    const slides = documentToSlides(doc, { maxWordsPerSlide: 100 });
    expect(slides.length).toBeGreaterThan(1);
    // Verify split slides have numbering
    expect(slides[0].title).toContain("(1/");
    expect(slides[1].title).toContain("(2/");
  });

  it("max bullet points is respected", () => {
    const content = Array.from({ length: 10 }, (_, i) => `- Item ${i + 1}`).join("\n");
    const doc: ParsedDocument = {
      title: "Test",
      sections: [
        {
          id: "s1",
          title: "Bullets",
          level: 1,
          content,
          children: [],
          metadata: { startIndex: 0, endIndex: content.length, wordCount: 20 },
        },
      ],
      metadata: { format: "markdown", totalWords: 20, totalSections: 1, headings: [] },
    };
    const slides = documentToSlides(doc, { maxBulletPoints: 3 });
    expect(slides).toHaveLength(1);
    expect(slides[0].content).toHaveLength(3);
  });

  it("includeSubsections processes children", () => {
    const doc = parseMarkdown(`# Chapter

Intro text.

## Section A

Content A.

## Section B

Content B.`);
    const slides = documentToSlides(doc, { includeSubsections: true });
    // Should have a slide for the chapter content plus slides for each subsection
    expect(slides.length).toBeGreaterThanOrEqual(2);
  });
});
