import type { ParsedDocument, DocumentSection, SlideOutline } from "./types";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Split a long text block into chunks of roughly maxWords words,
 * breaking at sentence boundaries when possible.
 */
function splitByWords(text: string, maxWords: number): string[] {
  // First try splitting by sentence boundaries
  const sentences = text.split(/(?<=[.!?])\s+/);

  // If only one "sentence" (no punctuation), fall back to word-based splitting
  if (sentences.length <= 1) {
    const allWords = text.trim().split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < allWords.length; i += maxWords) {
      chunks.push(allWords.slice(i, i + maxWords).join(" "));
    }
    return chunks;
  }

  const chunks: string[] = [];
  let current = "";
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    if (currentWords + sentenceWords > maxWords && current) {
      chunks.push(current.trim());
      current = sentence;
      currentWords = sentenceWords;
    } else {
      current = current ? current + " " + sentence : sentence;
      currentWords += sentenceWords;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Extract bullet-point-worthy content from a section.
 * Splits by newlines, dashes, or numbered lists.
 */
function extractBulletPoints(content: string, maxBullets: number): string[] {
  // Try splitting by list-like patterns
  const lines = content.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const bullets: string[] = [];
  for (const line of lines) {
    // Strip leading list markers
    const cleaned = line.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "").trim();
    if (cleaned) {
      bullets.push(cleaned);
    }
    if (bullets.length >= maxBullets) break;
  }

  // If we got more than one bullet, return them
  if (bullets.length > 1) return bullets;

  // Otherwise, try splitting by sentences
  const sentences = content.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const result: string[] = [];
  for (const s of sentences) {
    result.push(s);
    if (result.length >= maxBullets) break;
  }

  return result.length > 0 ? result : [content.trim()];
}

/**
 * Convert a parsed document into slide-sized outlines.
 */
export function documentToSlides(
  doc: ParsedDocument,
  options?: {
    maxWordsPerSlide?: number;
    maxBulletPoints?: number;
    includeSubsections?: boolean;
  }
): SlideOutline[] {
  const maxWords = options?.maxWordsPerSlide ?? 100;
  const maxBullets = options?.maxBulletPoints ?? 6;
  const includeSubsections = options?.includeSubsections ?? false;

  const slides: SlideOutline[] = [];

  function processSection(section: DocumentSection, parentTitle?: string): void {
    const wordCount = section.metadata.wordCount;
    const title = section.title || parentTitle || "Untitled";

    if (includeSubsections && section.children.length > 0) {
      // Section has children — each child becomes a bullet or its own slide
      // First, add the section's own content if any
      if (section.content.trim()) {
        const bullets = extractBulletPoints(section.content, maxBullets);
        slides.push({
          title,
          content: bullets,
          level: section.level,
          sourceSection: section.id,
        });
      }
      // Process children
      for (const child of section.children) {
        processSection(child, title);
      }
    } else if (wordCount <= maxWords) {
      // Short enough for a single slide
      const bullets = extractBulletPoints(section.content, maxBullets);
      slides.push({
        title,
        content: bullets,
        level: section.level,
        sourceSection: section.id,
      });
    } else {
      // Too long — split into multiple slides
      const chunks = splitByWords(section.content, maxWords);
      for (let i = 0; i < chunks.length; i++) {
        const slideTitle = chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title;
        const bullets = extractBulletPoints(chunks[i], maxBullets);
        slides.push({
          title: slideTitle,
          content: bullets,
          level: section.level,
          sourceSection: section.id,
        });
      }
    }
  }

  for (const section of doc.sections) {
    processSection(section);
  }

  return slides;
}
