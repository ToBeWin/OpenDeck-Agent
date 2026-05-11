import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../markdown";

describe("parseMarkdown", () => {
  it("parses h1 as title", () => {
    const doc = parseMarkdown("# My Presentation\n\nSome intro text.");
    expect(doc.title).toBe("My Presentation");
    expect(doc.sections).toHaveLength(1);
    expect(doc.sections[0].title).toBe("My Presentation");
    expect(doc.sections[0].level).toBe(1);
  });

  it("parses multiple heading levels", () => {
    const md = `# Title

## Section A

Content A

### Subsection A1

Content A1

## Section B

Content B`;

    const doc = parseMarkdown(md);
    expect(doc.title).toBe("Title");
    // h1 is the top-level section, h2s are children
    expect(doc.sections).toHaveLength(1);
    expect(doc.sections[0].title).toBe("Title");
    expect(doc.sections[0].level).toBe(1);
    expect(doc.sections[0].children).toHaveLength(2);
    expect(doc.sections[0].children[0].title).toBe("Section A");
    expect(doc.sections[0].children[0].level).toBe(2);
    expect(doc.sections[0].children[1].title).toBe("Section B");
    expect(doc.sections[0].children[1].level).toBe(2);
  });

  it("sections contain correct content", () => {
    const md = `## Intro

Hello world. This is some content.

## Outro

Goodbye world.`;

    const doc = parseMarkdown(md);
    expect(doc.sections[0].content).toContain("Hello world");
    expect(doc.sections[1].content).toContain("Goodbye world");
  });

  it("word count is accurate", () => {
    const md = `# Title

One two three four five.`;

    const doc = parseMarkdown(md);
    expect(doc.metadata.totalWords).toBe(7); // Title + One two three four five
    expect(doc.sections[0].metadata.wordCount).toBe(5); // One two three four five
  });

  it("nested sections (h2 under h1)", () => {
    const md = `# Chapter 1

Intro text.

## Section 1.1

Details here.

## Section 1.2

More details.`;

    const doc = parseMarkdown(md);
    // h1 is the title section, h2s are its children
    expect(doc.sections).toHaveLength(1); // One h1
    expect(doc.sections[0].title).toBe("Chapter 1");
    expect(doc.sections[0].children).toHaveLength(2);
    expect(doc.sections[0].children[0].title).toBe("Section 1.1");
    expect(doc.sections[0].children[1].title).toBe("Section 1.2");
  });

  it("empty content returns empty document", () => {
    const doc = parseMarkdown("");
    expect(doc.title).toBe("");
    expect(doc.sections).toHaveLength(0);
    expect(doc.metadata.totalWords).toBe(0);
    expect(doc.metadata.totalSections).toBe(0);
  });

  it("whitespace-only content returns empty document", () => {
    const doc = parseMarkdown("   \n\n  ");
    expect(doc.sections).toHaveLength(0);
  });

  it("content without headings produces a single section", () => {
    const doc = parseMarkdown("Just some text with no headings.");
    expect(doc.sections).toHaveLength(1);
    expect(doc.sections[0].content).toBe("Just some text with no headings.");
  });

  it("tracks headings in metadata", () => {
    const md = `# First

## Second

### Third

## Fourth`;

    const doc = parseMarkdown(md);
    expect(doc.metadata.headings).toEqual([
      { level: 1, text: "First" },
      { level: 2, text: "Second" },
      { level: 3, text: "Third" },
      { level: 2, text: "Fourth" },
    ]);
  });
});
