import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderAgenda(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;

  pptxSlide.background = { fill: theme.colors.background === "FFFFFF" ? "FFFFFF" : theme.colors.surface };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const bodyEls = slide.elements.filter(
    (el) => el.type === "text" && (el.role === "body" || el.role === "label")
  );

  // Left accent bar
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.15,
    h: 7.5,
    fill: { color: theme.colors.primary },
  });

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.5,
      w: 11.5,
      h: 1.2,
      fontSize: theme.typography.titleSize - 8,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Divider line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.8,
    w: 3.0,
    h: 0.04,
    fill: { color: theme.colors.primary },
  });

  let items: string[] = [];
  if (bodyEls.length > 1) {
    items = bodyEls.map((el) => el.content || "").filter(Boolean);
  } else if (bodyEls.length === 1) {
    items = (bodyEls[0].content || "").split("\n").map((s) => s.trim()).filter(Boolean);
  }

  if (items.length > 0) {
    items.forEach((text, i) => {
      const y = 2.2 + i * 0.9;
      if (y > 6.5) return;

      pptxSlide.addShape(pres.ShapeType.ellipse, {
        x: 0.8,
        y: y + 0.1,
        w: 0.45,
        h: 0.45,
        fill: { color: theme.colors.primary },
      });
      pptxSlide.addText(String(i + 1), {
        x: 0.8,
        y: y + 0.1,
        w: 0.45,
        h: 0.45,
        fontSize: 16,
        bold: true,
        color: theme.colors.textInverse,
        align: "center",
        fontFace: theme.typography.bodyFont,
        valign: "middle",
      });

      pptxSlide.addText(text, {
        x: 1.5,
        y: y,
        w: 10.5,
        h: 0.65,
        fontSize: theme.typography.bodySize + 2,
        color: theme.colors.textPrimary,
        align: "left",
        fontFace: theme.typography.bodyFont,
        valign: "middle",
      });
      editableTextCount++;
    });
  } else {
    const message = slide.mainMessage || "Agenda content";
    pptxSlide.addText(message, {
      x: 1.5,
      y: 2.2,
      w: 10.5,
      h: 4.0,
      fontSize: theme.typography.bodySize + 2,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
