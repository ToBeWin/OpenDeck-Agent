import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderSectionDivider(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;

  // Use primary color as background for strong section separation
  pptxSlide.background = { fill: theme.colors.primary };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const labelEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "label"
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );

  // Section number / label at the top
  if (labelEl) {
    pptxSlide.addText(labelEl.content || "", {
      x: 1.0,
      y: 1.5,
      w: 11.33,
      h: 0.8,
      fontSize: theme.typography.bodySize + 2,
      bold: true,
      color: theme.colors.textInverse,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "middle",
      transparency: 30,
    });
    editableTextCount++;
  }

  // Large section title centered
  const titleText = titleEl?.content || slide.mainMessage || "Section";
  pptxSlide.addText(titleText, {
    x: 1.0,
    y: 2.5,
    w: 11.33,
    h: 2.5,
    fontSize: theme.typography.titleSize + 8,
    bold: true,
    color: theme.colors.textInverse,
    align: "center",
    fontFace: theme.typography.titleFont,
    valign: "middle",
  });
  editableTextCount++;

  // Decorative accent line below title
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 5.2,
    w: 2.0,
    h: 0.06,
    fill: { color: theme.colors.textInverse },
  });

  // Optional subtitle
  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: 2.0,
      y: 5.5,
      w: 9.33,
      h: 0.8,
      fontSize: theme.typography.subtitleSize,
      color: theme.colors.textInverse,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "top",
      transparency: 20,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
