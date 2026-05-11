import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderTwoColumn(
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
  const bodyEls = slide.elements.filter((el) => el.type === "text" && el.role === "body");
  const subtitleEls = slide.elements.filter((el) => el.type === "text" && el.role === "subtitle");
  const labelEls = slide.elements.filter((el) => el.type === "text" && el.role === "label");

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8, y: 0.4, w: 11.7, h: 1.1,
      fontSize: theme.typography.titleSize - 12,
      bold: true, color: theme.colors.textPrimary, align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.6, w: 11.7, h: 0.03,
    fill: { color: theme.colors.border },
  });

  const leftLabel = labelEls[0];
  if (leftLabel) {
    pptxSlide.addText(leftLabel.content || "", {
      x: 0.8, y: 1.9, w: 5.5, h: 0.6,
      fontSize: theme.typography.bodySize, bold: true, color: theme.colors.primary, align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  const leftBody = bodyEls[0];
  if (leftBody) {
    pptxSlide.addText(leftBody.content || "", {
      x: 0.8, y: 2.6, w: 5.5, h: 4.0,
      fontSize: theme.typography.bodySize - 2, color: theme.colors.textPrimary, align: "left",
      fontFace: theme.typography.bodyFont, valign: "top", lineSpacing: 26,
    });
    editableTextCount++;
  }

  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 6.67, y: 1.9, w: 0.02, h: 4.8,
    fill: { color: theme.colors.border },
  });

  const rightLabel = labelEls[1] || subtitleEls[0];
  if (rightLabel) {
    pptxSlide.addText(rightLabel.content || "", {
      x: 7.0, y: 1.9, w: 5.5, h: 0.6,
      fontSize: theme.typography.bodySize, bold: true, color: theme.colors.primary, align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  const rightBody = bodyEls[1];
  if (rightBody) {
    pptxSlide.addText(rightBody.content || "", {
      x: 7.0, y: 2.6, w: 5.5, h: 4.0,
      fontSize: theme.typography.bodySize - 2, color: theme.colors.textPrimary, align: "left",
      fontFace: theme.typography.bodyFont, valign: "top", lineSpacing: 26,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
