import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderInsight(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;

  pptxSlide.background = { fill: theme.colors.surface };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const metricEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "metric"
  );
  const bodyEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );
  const footnoteEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "footnote"
  );

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.5,
      w: 11.7,
      h: 1.0,
      fontSize: theme.typography.titleSize - 16,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Metric card
  pptxSlide.addShape(pres.ShapeType.roundRect, {
    x: 2.5,
    y: 2.0,
    w: 8.33,
    h: 3.0,
    fill: { color: theme.colors.background },
    shadow: { type: "outer", blur: 10, offset: 2, color: "000000", opacity: 0.1 },
    rectRadius: 0.15,
  });

  if (metricEl) {
    pptxSlide.addText(metricEl.content || "", {
      x: 2.5,
      y: 2.2,
      w: 8.33,
      h: 2.0,
      fontSize: 72,
      bold: true,
      color: theme.colors.primary,
      align: "center",
      fontFace: theme.typography.titleFont,
      valign: "middle",
    });
    editableTextCount++;
  }

  if (bodyEl) {
    pptxSlide.addText(bodyEl.content || "", {
      x: 2.5,
      y: 4.2,
      w: 8.33,
      h: 0.8,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textSecondary,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
    editableTextCount++;
  }

  if (footnoteEl) {
    pptxSlide.addText(footnoteEl.content || "", {
      x: 0.8,
      y: 6.5,
      w: 11.7,
      h: 0.5,
      fontSize: theme.typography.captionSize - 2,
      color: theme.colors.secondary,
      align: "center",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
