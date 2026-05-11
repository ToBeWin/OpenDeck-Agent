import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Closing layout.
 * Large "Thank You" or closing message, centered.
 */
export function renderClosing(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number
): SlideRenderStats {
  const pptxSlide = pres.addSlide();

  let editableTextCount = 0;

  // Background — dark like cover
  pptxSlide.background = { fill: "0F1B2D" };

  // Extract elements
  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const bodyEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );

  // Decorative accent line
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 2.2,
    w: 2.0,
    h: 0.06,
    fill: { color: "4FC3F7" },
  });

  // Main closing text — large centered
  const closingText = titleEl?.content || "Thank You";
  pptxSlide.addText(closingText, {
    x: 1.0,
    y: 2.5,
    w: 11.33,
    h: 2.0,
    fontSize: 52,
    bold: true,
    color: "FFFFFF",
    align: "center",
    fontFace: "Microsoft YaHei",
    valign: "middle",
  });
  editableTextCount++;

  // Body text (main closing message)
  if (bodyEl) {
    pptxSlide.addText(bodyEl.content || "", {
      x: 2.0,
      y: 4.5,
      w: 9.33,
      h: 1.2,
      fontSize: 18,
      color: "B0BEC5",
      align: "center",
      fontFace: "Microsoft YaHei",
      valign: "top",
    });
    editableTextCount++;
  }

  // Subtitle (contact info, etc.)
  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
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

  // Decorative bottom accent
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 5.67,
    y: 6.0,
    w: 2.0,
    h: 0.06,
    fill: { color: "4FC3F7" },
  });

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
