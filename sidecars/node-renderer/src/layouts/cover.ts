import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Cover / Hero Title layout.
 * Large centered title + subtitle below. Real editable text boxes.
 */
export function renderCover(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number
): SlideRenderStats {
  const pptxSlide = pres.addSlide();

  let editableTextCount = 0;

  // Background — subtle gradient-like solid
  pptxSlide.background = { fill: "0F1B2D" };

  // Extract elements
  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const captionEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "caption" || el.role === "footnote")
  );
  // Also check for body element as author line (some decks use body for this)
  const authorEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );

  // Decorative accent line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 2.4,
    w: 2.0,
    h: 0.06,
    fill: { color: "4FC3F7" },
  });

  // Title — large, centered, white
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 1.0,
      y: 2.7,
      w: 11.33,
      h: 1.6,
      fontSize: 44,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: "Microsoft YaHei",
      valign: "middle",
    });
    editableTextCount++;
  }

  // Subtitle — slightly smaller, centered, light gray
  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: 2.0,
      y: 4.5,
      w: 9.33,
      h: 1.0,
      fontSize: 22,
      color: "B0BEC5",
      align: "center",
      fontFace: "Microsoft YaHei",
      valign: "top",
    });
    editableTextCount++;
  }

  // Caption / date line / author
  const captionText = captionEl?.content || authorEl?.content;
  if (captionText) {
    pptxSlide.addText(captionText, {
      x: 2.0,
      y: 5.8,
      w: 9.33,
      h: 0.6,
      fontSize: 14,
      color: "78909C",
      align: "center",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Speaker note
  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
