import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Agenda / Title + Content layout.
 * Title at top, numbered list of sections below. Real editable text boxes.
 */
export function renderAgenda(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number
): SlideRenderStats {
  const pptxSlide = pres.addSlide();

  let editableTextCount = 0;

  // Background
  pptxSlide.background = { fill: "FFFFFF" };

  // Extract elements
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
    fill: { color: "1565C0" },
  });

  // Title
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.5,
      w: 11.5,
      h: 1.2,
      fontSize: 36,
      bold: true,
      color: "1A1A2E",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Divider line under title
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.8,
    w: 3.0,
    h: 0.04,
    fill: { color: "1565C0" },
  });

  // Section items — either from multiple body elements or split a single body by newlines
  let items: string[] = [];
  if (bodyEls.length > 1) {
    items = bodyEls.map((el) => el.content || "").filter(Boolean);
  } else if (bodyEls.length === 1) {
    // Split single body by newlines
    items = (bodyEls[0].content || "").split("\n").map((s) => s.trim()).filter(Boolean);
  }

  if (items.length > 0) {
    items.forEach((text, i) => {
      const y = 2.2 + i * 0.9;
      if (y > 6.5) return; // Don't overflow

      // Number circle
      pptxSlide.addShape(pres.ShapeType.ellipse, {
        x: 0.8,
        y: y + 0.1,
        w: 0.45,
        h: 0.45,
        fill: { color: "1565C0" },
      });
      pptxSlide.addText(String(i + 1), {
        x: 0.8,
        y: y + 0.1,
        w: 0.45,
        h: 0.45,
        fontSize: 16,
        bold: true,
        color: "FFFFFF",
        align: "center",
        fontFace: "Microsoft YaHei",
        valign: "middle",
      });

      // Section text
      pptxSlide.addText(text, {
        x: 1.5,
        y: y,
        w: 10.5,
        h: 0.65,
        fontSize: 20,
        color: "333333",
        align: "left",
        fontFace: "Microsoft YaHei",
        valign: "middle",
      });
      editableTextCount++;
    });
  } else {
    // If no body elements, try to use mainMessage
    const message = slide.mainMessage || "Agenda content";
    pptxSlide.addText(message, {
      x: 1.5,
      y: 2.2,
      w: 10.5,
      h: 4.0,
      fontSize: 20,
      color: "333333",
      align: "left",
      fontFace: "Microsoft YaHei",
      valign: "top",
    });
    editableTextCount++;
  }

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
