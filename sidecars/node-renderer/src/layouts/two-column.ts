import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Two Column layout.
 * Title at top + left and right content areas.
 */
export function renderTwoColumn(
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
    (el) => el.type === "text" && el.role === "body"
  );
  const subtitleEls = slide.elements.filter(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const labelEls = slide.elements.filter(
    (el) => el.type === "text" && el.role === "label"
  );

  // Title
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.4,
      w: 11.7,
      h: 1.1,
      fontSize: 32,
      bold: true,
      color: "1A1A2E",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Divider line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 0.03,
    fill: { color: "E0E0E0" },
  });

  // Left column header
  const leftLabel = labelEls[0];
  if (leftLabel) {
    pptxSlide.addText(leftLabel.content || "", {
      x: 0.8,
      y: 1.9,
      w: 5.5,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: "1565C0",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Left column body
  const leftBody = bodyEls[0];
  if (leftBody) {
    pptxSlide.addText(leftBody.content || "", {
      x: 0.8,
      y: 2.6,
      w: 5.5,
      h: 4.0,
      fontSize: 16,
      color: "333333",
      align: "left",
      fontFace: "Microsoft YaHei",
      valign: "top",
      lineSpacing: 26,
    });
    editableTextCount++;
  }

  // Vertical divider
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 6.67,
    y: 1.9,
    w: 0.02,
    h: 4.8,
    fill: { color: "E0E0E0" },
  });

  // Right column header
  const rightLabel = labelEls[1] || subtitleEls[0];
  if (rightLabel) {
    pptxSlide.addText(rightLabel.content || "", {
      x: 7.0,
      y: 1.9,
      w: 5.5,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: "1565C0",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Right column body
  const rightBody = bodyEls[1];
  if (rightBody) {
    pptxSlide.addText(rightBody.content || "", {
      x: 7.0,
      y: 2.6,
      w: 5.5,
      h: 4.0,
      fontSize: 16,
      color: "333333",
      align: "left",
      fontFace: "Microsoft YaHei",
      valign: "top",
      lineSpacing: 26,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
