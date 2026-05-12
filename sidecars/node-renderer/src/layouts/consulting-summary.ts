import PptxGenJS from "pptxgenjs";
import type { SlideData } from "../renderer";
import type { ThemeTokens } from "../theme";
import type { SlideRenderStats } from ".";

export function renderConsultingSummary(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  pptxSlide.background = { fill: theme.colors.background };

  let editableTextCount = 0;

  // Header accent bar
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { type: "solid", color: theme.colors.accent },
    line: { width: 0 },
  });

  const title = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  if (title) {
    pptxSlide.addText(title.content || "", {
      x: 0.6, y: 0.3, w: 12.13, h: 0.8,
      fontSize: theme.typography.titleSize - 4,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  const bodyElements = slide.elements.filter(
    (el) => el.type === "text" && el.role === "body"
  );

  const colW = 5.8;
  const startY = 1.5;
  const gap = 0.3;

  bodyElements.forEach((el, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (colW + gap);
    const y = startY + row * 2.2;

    // Card background
    pptxSlide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: 1.8,
      fill: { type: "solid", color: theme.colors.surface },
      rectRadius: 0.1,
      line: { width: 0.5, color: theme.colors.border },
    });

    // Left accent bar
    pptxSlide.addShape(pres.ShapeType.rect, {
      x, y, w: 0.06, h: 1.8,
      fill: { type: "solid", color: theme.colors.accent },
      line: { width: 0 },
    });

    pptxSlide.addText(el.content || "", {
      x: x + 0.3, y: y + 0.15, w: colW - 0.5, h: 1.5,
      fontSize: 11,
      color: theme.colors.textSecondary,
      align: "left",
      valign: "top",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  });

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
