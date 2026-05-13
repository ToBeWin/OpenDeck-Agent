import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";
import { renderHeroImage, renderSlideImage } from "./image-helper";

export function renderCover(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;
  let imageCount = 0;

  pptxSlide.background = { fill: theme.colors.background };

  // Hero image as full background if present
  if (renderHeroImage(pres, pptxSlide, slide, theme)) {
    imageCount++;
    // Dark overlay for readability
    pptxSlide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 7.5,
      fill: { type: "solid", color: "000000" },
      line: { width: 0 },
    });
  }

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const captionEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "caption" || el.role === "footnote")
  );
  const authorEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );

  // Decorative accent line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 2.4,
    w: 2.0,
    h: 0.06,
    fill: { color: theme.colors.primary },
  });

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 1.0,
      y: 2.7,
      w: 11.33,
      h: 1.6,
      fontSize: theme.typography.titleSize,
      bold: true,
      color: theme.colors.textInverse,
      align: "center",
      fontFace: theme.typography.titleFont,
      valign: "middle",
    });
    editableTextCount++;
  }

  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: 2.0,
      y: 4.5,
      w: 9.33,
      h: 1.0,
      fontSize: theme.typography.subtitleSize,
      color: theme.colors.textSecondary,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
    editableTextCount++;
  }

  const captionText = captionEl?.content || authorEl?.content;
  if (captionText) {
    pptxSlide.addText(captionText, {
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

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount, chartCount: 0, tableCount: 0 };
}
