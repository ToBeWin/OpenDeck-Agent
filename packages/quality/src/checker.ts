import type { Deck, Slide, SlideElement } from "@opendeck/slide-dsl";
import type { DeckQualityScore, SlideQualityScore, QualityIssue } from "./types";

// ─── Slide-level checks ──────────────────────────────────────────────────────

function checkSlideContent(slide: Slide): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check main message exists
  if (!slide.mainMessage || slide.mainMessage.trim().length === 0) {
    issues.push({
      severity: "warning",
      category: "content",
      slideId: slide.id,
      message: "Slide has no main message defined",
      autoFixable: false,
    });
  }

  // Check communication goal
  if (!slide.communicationGoal || slide.communicationGoal.trim().length === 0) {
    issues.push({
      severity: "info",
      category: "content",
      slideId: slide.id,
      message: "Slide has no communication goal",
      autoFixable: false,
    });
  }

  // Check for title element
  const hasTitle = slide.elements.some(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  if (!hasTitle) {
    issues.push({
      severity: "warning",
      category: "content",
      slideId: slide.id,
      message: "Slide has no title element",
      autoFixable: false,
    });
  }

  // Check for weak titles (too short or generic)
  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  if (titleEl && titleEl.type === "text") {
    const content = titleEl.content || "";
    if (content.length < 3) {
      issues.push({
        severity: "warning",
        category: "content",
        slideId: slide.id,
        message: `Title is too short: "${content}"`,
        autoFixable: true,
      });
    }
    const genericTitles = ["title", "slide", "untitled", "标题", "幻灯片"];
    if (genericTitles.some((g) => content.toLowerCase().includes(g))) {
      issues.push({
        severity: "warning",
        category: "content",
        slideId: slide.id,
        message: `Generic title detected: "${content}"`,
        autoFixable: true,
      });
    }
  }

  return issues;
}

function checkSlideVisual(slide: Slide): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check for overcrowded slides (too many elements)
  const textElements = slide.elements.filter((el) => el.type === "text");
  if (textElements.length > 8) {
    issues.push({
      severity: "warning",
      category: "visual",
      slideId: slide.id,
      message: `Slide has ${textElements.length} text elements — may be overcrowded`,
      autoFixable: true,
    });
  }

  // Check total text length
  const totalTextLength = textElements.reduce((sum, el) => {
    return sum + (el.type === "text" ? (el.content || "").length : 0);
  }, 0);
  if (totalTextLength > 800) {
    issues.push({
      severity: "warning",
      category: "overflow",
      slideId: slide.id,
      message: `Total text length is ${totalTextLength} characters — risk of overflow`,
      autoFixable: true,
    });
  }

  // Check for missing visuals on content-heavy slides
  const hasImage = slide.elements.some((el) => el.type === "image");
  const hasChart = slide.elements.some((el) => el.type === "chart");
  const hasTable = slide.elements.some((el) => el.type === "table");
  if (textElements.length > 4 && !hasImage && !hasChart && !hasTable && slide.type !== "cover" && slide.type !== "closing") {
    issues.push({
      severity: "info",
      category: "visual",
      slideId: slide.id,
      message: "Content-heavy slide has no visual elements (image, chart, or table)",
      autoFixable: false,
    });
  }

  return issues;
}

function checkSlideEditability(slide: Slide): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check that text elements are editable
  const nonEditableText = slide.elements.filter(
    (el) => el.type === "text" && !el.editable
  );
  if (nonEditableText.length > 0) {
    issues.push({
      severity: "error",
      category: "editability",
      slideId: slide.id,
      message: `${nonEditableText.length} text elements are not editable`,
      autoFixable: true,
    });
  }

  // Check that table elements are editable
  const nonEditableTables = slide.elements.filter(
    (el) => el.type === "table" && !el.editable
  );
  if (nonEditableTables.length > 0) {
    issues.push({
      severity: "error",
      category: "editability",
      slideId: slide.id,
      message: `${nonEditableTables.length} table elements are not editable`,
      autoFixable: true,
    });
  }

  return issues;
}

function scoreSlide(slide: Slide): SlideQualityScore {
  const contentIssues = checkSlideContent(slide);
  const visualIssues = checkSlideVisual(slide);
  const editabilityIssues = checkSlideEditability(slide);
  const allIssues = [...contentIssues, ...visualIssues, ...editabilityIssues];

  const errorCount = allIssues.filter((i) => i.severity === "error").length;
  const warningCount = allIssues.filter((i) => i.severity === "warning").length;

  const contentScore = Math.max(0, 100 - contentIssues.length * 15);
  const visualScore = Math.max(0, 100 - visualIssues.length * 15);
  const editabilityScore = Math.max(0, 100 - errorCount * 25 - warningCount * 10);
  const overall = Math.round((contentScore + visualScore + editabilityScore) / 3);

  return {
    slideId: slide.id,
    overall,
    content: contentScore,
    visual: visualScore,
    editability: editabilityScore,
    issues: allIssues,
  };
}

// ─── Deck-level checks ───────────────────────────────────────────────────────

function checkDeckConsistency(deck: Deck): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check for duplicate slide types (e.g., multiple covers)
  const typeCounts = new Map<string, number>();
  for (const slide of deck.slides) {
    typeCounts.set(slide.type, (typeCounts.get(slide.type) || 0) + 1);
  }
  const covers = typeCounts.get("cover") || 0;
  if (covers > 1) {
    issues.push({
      severity: "warning",
      category: "consistency",
      message: `Deck has ${covers} cover slides`,
      autoFixable: false,
    });
  }
  const closings = typeCounts.get("closing") || 0;
  if (closings > 1) {
    issues.push({
      severity: "warning",
      category: "consistency",
      message: `Deck has ${closings} closing slides`,
      autoFixable: false,
    });
  }

  // Check slide indices are sequential
  for (let i = 0; i < deck.slides.length; i++) {
    if (deck.slides[i].index !== i) {
      issues.push({
        severity: "warning",
        category: "consistency",
        message: `Slide index mismatch: expected ${i}, got ${deck.slides[i].index}`,
        autoFixable: true,
      });
      break;
    }
  }

  // Check for empty deck
  if (deck.slides.length === 0) {
    issues.push({
      severity: "error",
      category: "consistency",
      message: "Deck has no slides",
      autoFixable: false,
    });
  }

  return issues;
}

function checkDeckCompatibility(deck: Deck): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check language is set
  if (!deck.language) {
    issues.push({
      severity: "warning",
      category: "compatibility",
      message: "Deck language is not specified",
      autoFixable: true,
    });
  }

  // Check aspect ratio
  if (!deck.aspectRatio) {
    issues.push({
      severity: "info",
      category: "compatibility",
      message: "Aspect ratio not specified, will default to 16:9",
      autoFixable: true,
    });
  }

  return issues;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function scoreDeck(deck: Deck): DeckQualityScore {
  const slideScores = deck.slides.map(scoreSlide);
  const consistencyIssues = checkDeckConsistency(deck);
  const compatibilityIssues = checkDeckCompatibility(deck);

  const allSlideIssues = slideScores.flatMap((s) => s.issues);
  const allIssues = [...allSlideIssues, ...consistencyIssues, ...compatibilityIssues];

  const contentAvg = slideScores.length > 0
    ? Math.round(slideScores.reduce((s, sc) => s + sc.content, 0) / slideScores.length)
    : 0;
  const visualAvg = slideScores.length > 0
    ? Math.round(slideScores.reduce((s, sc) => s + sc.visual, 0) / slideScores.length)
    : 0;
  const editabilityAvg = slideScores.length > 0
    ? Math.round(slideScores.reduce((s, sc) => s + sc.editability, 0) / slideScores.length)
    : 0;

  const errorCount = allIssues.filter((i) => i.severity === "error").length;
  const warningCount = allIssues.filter((i) => i.severity === "warning").length;

  const logicScore = Math.max(0, 100 - consistencyIssues.length * 20);
  const consistencyScore = Math.max(0, 100 - consistencyIssues.length * 15);
  const compatibilityScore = Math.max(0, 100 - compatibilityIssues.length * 15);

  const overall = Math.round(
    (contentAvg + visualAvg + editabilityAvg + logicScore + consistencyScore + compatibilityScore) / 6
  );

  const summary = errorCount > 0
    ? `${errorCount} errors, ${warningCount} warnings found`
    : warningCount > 0
      ? `${warningCount} warnings found`
      : "All checks passed";

  return {
    overall,
    content: contentAvg,
    logic: logicScore,
    visual: visualAvg,
    editability: editabilityAvg,
    consistency: consistencyScore,
    compatibility: compatibilityScore,
    slides: slideScores,
    issues: allIssues,
    summary,
  };
}

export function scoreSlideCheck(slide: Slide): SlideQualityScore {
  return scoreSlide(slide);
}
