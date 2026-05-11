import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderSolution(
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
  const bodyEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );

  // Green/blue accent bar at the top to signal resolution
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.12,
    fill: { color: theme.colors.chartColors[2] || theme.colors.primary },
  });

  // Checkmark decoration
  const checkColor = theme.colors.chartColors[2] || theme.colors.primary;
  pptxSlide.addShape(pres.ShapeType.ellipse, {
    x: 0.8,
    y: 0.6,
    w: 0.7,
    h: 0.7,
    fill: { color: checkColor },
  });
  pptxSlide.addText("✓", {
    x: 0.8,
    y: 0.6,
    w: 0.7,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: theme.colors.textInverse,
    align: "center",
    fontFace: theme.typography.titleFont,
    valign: "middle",
  });

  // "Solution" label
  pptxSlide.addText("SOLUTION", {
    x: 1.8,
    y: 0.65,
    w: 4.0,
    h: 0.55,
    fontSize: theme.typography.captionSize,
    bold: true,
    color: checkColor,
    align: "left",
    fontFace: theme.typography.bodyFont,
    valign: "middle",
  });

  // Title
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 1.4,
      fontSize: theme.typography.titleSize - 8,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
      valign: "middle",
    });
    editableTextCount++;
  }

  // Accent divider
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 3.1,
    w: 3.0,
    h: 0.04,
    fill: { color: checkColor },
  });

  // Solution content card
  pptxSlide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 3.4,
    w: 11.7,
    h: 3.2,
    fill: { color: theme.colors.surface },
    line: { color: checkColor, width: 1.5 },
    rectRadius: 0.1,
  });

  if (bodyEl) {
    pptxSlide.addText(bodyEl.content || "", {
      x: 1.2,
      y: 3.6,
      w: 10.9,
      h: 2.8,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      valign: "top",
      lineSpacing: 26,
    });
    editableTextCount++;
  }

  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: 0.8,
      y: 6.8,
      w: 11.7,
      h: 0.5,
      fontSize: theme.typography.captionSize,
      color: theme.colors.textSecondary,
      align: "right",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
