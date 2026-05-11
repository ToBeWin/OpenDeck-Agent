import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderSummary(
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
  const bodyEls = slide.elements.filter(
    (el) => el.type === "text" && (el.role === "body" || el.role === "label")
  );

  // Title
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.4,
      w: 11.7,
      h: 1.1,
      fontSize: theme.typography.titleSize - 10,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Divider
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 3.0,
    h: 0.04,
    fill: { color: theme.colors.primary },
  });

  // Collect bullet items
  let items: string[] = [];
  if (bodyEls.length > 1) {
    items = bodyEls.map((el) => el.content || "").filter(Boolean);
  } else if (bodyEls.length === 1) {
    items = (bodyEls[0].content || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (items.length > 0) {
    // Render as bullet cards
    const maxItems = Math.min(items.length, 6);
    const cardHeight = Math.min(0.8, 4.5 / maxItems);
    const startY = 2.0;

    items.slice(0, maxItems).forEach((text, i) => {
      const y = startY + i * (cardHeight + 0.15);

      // Bullet marker
      pptxSlide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: y + 0.12,
        w: 0.35,
        h: 0.35,
        fill: { color: theme.colors.primary },
        rectRadius: 0.05,
      });

      // Bullet number
      pptxSlide.addText(String(i + 1), {
        x: 0.8,
        y: y + 0.12,
        w: 0.35,
        h: 0.35,
        fontSize: 14,
        bold: true,
        color: theme.colors.textInverse,
        align: "center",
        fontFace: theme.typography.bodyFont,
        valign: "middle",
      });

      // Item text
      pptxSlide.addText(text, {
        x: 1.4,
        y: y,
        w: 11.1,
        h: cardHeight,
        fontSize: theme.typography.bodySize,
        color: theme.colors.textPrimary,
        align: "left",
        fontFace: theme.typography.bodyFont,
        valign: "middle",
      });
      editableTextCount++;
    });
  } else {
    // Fallback: show main message
    const message = slide.mainMessage || "Summary content";
    pptxSlide.addText(message, {
      x: 1.4,
      y: 2.0,
      w: 10.5,
      h: 4.5,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      valign: "top",
      lineSpacing: 26,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
