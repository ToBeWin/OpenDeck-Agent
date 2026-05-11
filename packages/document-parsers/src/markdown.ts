import type { ParsedDocument, DocumentSection } from "./types";

let nextId = 0;
function generateId(): string {
  return `section-${nextId++}`;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Parse markdown content into a structured document.
 *
 * Headings (# through ######) define sections. Content between headings of
 * equal or higher level is grouped under the preceding heading. Lower-level
 * headings become nested children.
 */
export function parseMarkdown(content: string): ParsedDocument {
  nextId = 0;

  if (!content || !content.trim()) {
    return {
      title: "",
      sections: [],
      metadata: { format: "markdown", totalWords: 0, totalSections: 0, headings: [] },
    };
  }

  const lines = content.split("\n");
  const headings: Array<{ level: number; text: string }> = [];

  // First pass: find all heading positions
  interface HeadingInfo {
    level: number;
    text: string;
    lineIndex: number;
    startOffset: number;
  }

  const headingInfos: HeadingInfo[] = [];
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headingInfos.push({
        level: match[1].length,
        text: match[2].trim(),
        lineIndex: i,
        startOffset: offset,
      });
      headings.push({ level: match[1].length, text: match[2].trim() });
    }
    offset += line.length + 1; // +1 for newline
  }

  if (headingInfos.length === 0) {
    // No headings — entire content is one unnamed section
    const wordCount = countWords(content);
    const section: DocumentSection = {
      id: generateId(),
      title: "",
      level: 0,
      content: content.trim(),
      children: [],
      metadata: { startIndex: 0, endIndex: content.length, wordCount },
    };
    return {
      title: "",
      sections: [section],
      metadata: { format: "markdown", totalWords: wordCount, totalSections: 1, headings: [] },
    };
  }

  // Second pass: build sections with content ranges
  interface RawSection {
    level: number;
    title: string;
    contentStart: number;
    contentEnd: number;
    headingOffset: number;
  }

  const rawSections: RawSection[] = [];
  for (let i = 0; i < headingInfos.length; i++) {
    const h = headingInfos[i];
    const contentStart = h.startOffset + lines[h.lineIndex].length + 1; // after heading line + newline
    const contentEnd = i + 1 < headingInfos.length ? headingInfos[i + 1].startOffset : content.length;
    rawSections.push({
      level: h.level,
      title: h.text,
      contentStart,
      contentEnd,
      headingOffset: h.startOffset,
    });
  }

  // Build sections with proper nesting
  function buildSections(items: RawSection[], minLevel: number): DocumentSection[] {
    const result: DocumentSection[] = [];
    let i = 0;
    while (i < items.length) {
      const item = items[i];
      if (item.level < minLevel) {
        break;
      }
      // Collect content until the next item at the same or higher level
      let contentEnd = item.contentEnd;
      let j = i + 1;
      // Find children (items with level > item.level before next sibling at item.level)
      const childrenItems: RawSection[] = [];
      while (j < items.length && items[j].level > item.level) {
        childrenItems.push(items[j]);
        j++;
      }
      // Content is from contentStart to the start of the first child (or contentEnd)
      const childContentEnd = childrenItems.length > 0 ? childrenItems[0].headingOffset : contentEnd;
      const sectionContent = content.slice(item.contentStart, childContentEnd).trim();
      const wordCount = countWords(sectionContent);

      const children = buildSections(childrenItems, item.level + 1);

      result.push({
        id: generateId(),
        title: item.title,
        level: item.level,
        content: sectionContent,
        children,
        metadata: {
          startIndex: item.headingOffset,
          endIndex: contentEnd,
          wordCount,
        },
      });

      i = j;
    }
    return result;
  }

  const sections = buildSections(rawSections, 1);

  const title = headings.length > 0 && headings[0].level === 1 ? headings[0].text : "";
  const totalWords = countWords(content);

  // Count total sections recursively
  function countSections(secs: DocumentSection[]): number {
    let count = 0;
    for (const s of secs) {
      count += 1 + countSections(s.children);
    }
    return count;
  }

  return {
    title,
    sections,
    metadata: {
      format: "markdown",
      totalWords,
      totalSections: countSections(sections),
      headings,
    },
  };
}
