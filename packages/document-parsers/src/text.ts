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
 * Heuristic: a line looks like a title if it is short (< 80 chars),
 * contains no period at the end, and is a single line.
 */
function looksLikeTitle(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 80) return false;
  if (trimmed.endsWith(".")) return false;
  return true;
}

/**
 * Parse plain text into a structured document.
 *
 * Text is split by double newlines into paragraphs. If the first line looks
 * like a title (short, no trailing period), it becomes the document title
 * and the remaining paragraphs become sections.
 */
export function parseText(content: string): ParsedDocument {
  nextId = 0;

  if (!content || !content.trim()) {
    return {
      title: "",
      sections: [],
      metadata: { format: "text", totalWords: 0, totalSections: 0, headings: [] },
    };
  }

  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  if (paragraphs.length === 0) {
    return {
      title: "",
      sections: [],
      metadata: { format: "text", totalWords: 0, totalSections: 0, headings: [] },
    };
  }

  let title = "";
  let sectionParagraphs: string[];
  let offset = 0;

  if (looksLikeTitle(paragraphs[0])) {
    title = paragraphs[0].trim();
    sectionParagraphs = paragraphs.slice(1);
    offset = content.indexOf(paragraphs[1] ?? "", paragraphs[0].length);
    if (offset === -1) offset = paragraphs[0].length;
  } else {
    sectionParagraphs = paragraphs;
    offset = 0;
  }

  const sections: DocumentSection[] = [];
  const headings: Array<{ level: number; text: string }> = [];
  let searchOffset = offset;

  for (const para of sectionParagraphs) {
    const idx = content.indexOf(para, searchOffset);
    const startIndex = idx >= 0 ? idx : searchOffset;
    const endIndex = startIndex + para.length;
    const wordCount = countWords(para);

    // Use first sentence or first line as section title
    const firstLine = para.split("\n")[0].trim();
    const sectionTitle = firstLine.length > 80 ? firstLine.slice(0, 77) + "..." : firstLine;

    headings.push({ level: 1, text: sectionTitle });

    sections.push({
      id: generateId(),
      title: sectionTitle,
      level: 1,
      content: para,
      children: [],
      metadata: { startIndex, endIndex, wordCount },
    });

    searchOffset = endIndex;
  }

  const totalWords = countWords(content);

  return {
    title,
    sections,
    metadata: {
      format: "text",
      totalWords,
      totalSections: sections.length,
      headings,
    },
  };
}
