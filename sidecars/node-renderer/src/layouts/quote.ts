import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderQuote(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;

  pptxSlide.background = { fill: theme.colors.surface };

  const bodyEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );

  // Large opening quotation mark decoration
  pptxSlide.addText("“", {
    x: 1.5,
    y: 0.8,
    w: 2.0,
    h: 2.5,
    fontSize: 160,
    bold: true,
    color: theme.colors.primary,
    align: "left",
    fontFace: "Georgia",
    transparency: 30,
  });

  // The quote text (from body element, or title as fallback)
  const quoteText = bodyEl?.content || titleEl?.content || "";
  if (quoteText) {
    pptxSlide.addText(quoteText, {
      x: 2.0,
      y: 2.0,
      w: 9.33,
      h: 3.0,
      fontSize: theme.typography.titleSize - 8,
      italic: true,
      color: theme.colors.textPrimary,
      align: "center",
      fontFace: "Georgia",
      valign: "middle",
      lineSpacing: 36,
    });
    editableTextCount++;
  }

  // Closing quotation mark
  pptxSlide.addText("”", {
    x: 9.83,
    y: 4.0,
    w: 2.0,
    h: 2.5,
    fontSize: 160,
    bold: true,
    color: theme.colors.primary,
    align: "right",
    fontFace: "Georgia",
    transparency: 30,
  });

  // Decorative line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 5.3,
    w: 2.0,
    h: 0.04,
    fill: { color: theme.colors.primary },
  });

  // Attribution line (from subtitle element)
  const attribution = subtitleEl?.content || titleEl?.content || "";
  if (attribution && subtitleEl) {
    pptxSlide.addText(`— ${attribution}`, {
      x: 2.0,
      y: 5.6,
      w: 9.33,
      h: 0.7,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textSecondary,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
