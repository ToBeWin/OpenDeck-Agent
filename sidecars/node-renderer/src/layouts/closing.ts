import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderClosing(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;

  pptxSlide.background = { fill: theme.colors.background };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const bodyEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );

  // Decorative accent line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 2.2,
    w: 2.0,
    h: 0.06,
    fill: { color: theme.colors.primary },
  });

  const closingText = titleEl?.content || "Thank You";
  pptxSlide.addText(closingText, {
    x: 1.0,
    y: 2.5,
    w: 11.33,
    h: 2.0,
    fontSize: 52,
    bold: true,
    color: theme.colors.textInverse,
    align: "center",
    fontFace: theme.typography.titleFont,
    valign: "middle",
  });
  editableTextCount++;

  if (bodyEl) {
    pptxSlide.addText(bodyEl.content || "", {
      x: 2.0,
      y: 4.5,
      w: 9.33,
      h: 1.2,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textSecondary,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
    editableTextCount++;
  }

  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: 2.0,
      y: 5.8,
      w: 9.33,
      h: 0.6,
      fontSize: theme.typography.captionSize,
      color: theme.colors.secondary,
      align: "center",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  // Decorative bottom accent
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 6.0,
    w: 2.0,
    h: 0.06,
    fill: { color: theme.colors.primary },
  });

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
