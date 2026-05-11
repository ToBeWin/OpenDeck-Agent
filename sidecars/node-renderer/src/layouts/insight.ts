import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Insight / Big Number layout.
 * Large metric number prominently displayed + supporting text below.
 */
export function renderInsight(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number
): SlideRenderStats {
  const pptxSlide = pres.addSlide();

  let editableTextCount = 0;

  // Background
  pptxSlide.background = { fill: "F5F7FA" };

  // Extract elements
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

  // Title — top left
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.5,
      w: 11.7,
      h: 1.0,
      fontSize: 28,
      bold: true,
      color: "1A1A2E",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Metric card background
  pptxSlide.addShape(pres.ShapeType.roundRect, {
    x: 2.5,
    y: 2.0,
    w: 8.33,
    h: 3.0,
    fill: { color: "FFFFFF" },
    shadow: {
      type: "outer",
      blur: 10,
      offset: 2,
      color: "000000",
      opacity: 0.1,
    },
    rectRadius: 0.15,
  });

  // Large metric number — center of card
  if (metricEl) {
    pptxSlide.addText(metricEl.content || "", {
      x: 2.5,
      y: 2.2,
      w: 8.33,
      h: 2.0,
      fontSize: 72,
      bold: true,
      color: "1565C0",
      align: "center",
      fontFace: "Microsoft YaHei",
      valign: "middle",
    });
    editableTextCount++;
  }

  // Supporting body text
  if (bodyEl) {
    pptxSlide.addText(bodyEl.content || "", {
      x: 2.5,
      y: 4.2,
      w: 8.33,
      h: 0.8,
      fontSize: 18,
      color: "546E7A",
      align: "center",
      fontFace: "Microsoft YaHei",
      valign: "top",
    });
    editableTextCount++;
  }

  // Footnote
  if (footnoteEl) {
    pptxSlide.addText(footnoteEl.content || "", {
      x: 0.8,
      y: 6.5,
      w: 11.7,
      h: 0.5,
      fontSize: 12,
      color: "90A4AE",
      align: "center",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
