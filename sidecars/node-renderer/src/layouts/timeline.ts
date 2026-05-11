import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Timeline layout.
 * Title at top + horizontal timeline with labeled milestone points.
 * Uses shapes + text objects for each timeline node.
 */
export function renderTimeline(
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

  // Title
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.4,
      w: 11.7,
      h: 1.0,
      fontSize: 30,
      bold: true,
      color: "1A1A2E",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Timeline line (horizontal)
  const lineY = 3.5;
  const lineStartX = 1.0;
  const lineEndX = 12.33;

  pptxSlide.addShape(pres.ShapeType.rect, {
    x: lineStartX,
    y: lineY - 0.02,
    w: lineEndX - lineStartX,
    h: 0.04,
    fill: { color: "1565C0" },
  });

  // Timeline points — use body elements as milestones, or split single body by newlines
  let milestones: string[] = [];
  if (bodyEls.length > 1) {
    milestones = bodyEls.map((el) => el.content || "").filter(Boolean);
  } else if (bodyEls.length === 1) {
    // Split by double newlines (each milestone separated by blank line) or single newlines
    const raw = bodyEls[0].content || "";
    // Try splitting by lines that look like "2022: ..." or "2022 ..." patterns
    const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    // Group lines into milestones — each line starting with a year is a new milestone
    const yearPattern = /^\d{4}/;
    let current = "";
    for (const line of lines) {
      if (yearPattern.test(line) && current) {
        milestones.push(current);
        current = line;
      } else {
        current = current ? current + "\n" + line : line;
      }
    }
    if (current) milestones.push(current);
    // If no year pattern found, treat each line as a milestone
    if (milestones.length === 0) {
      milestones = lines;
    }
  }

  const pointCount = Math.max(milestones.length, 1);
  const spacing = (lineEndX - lineStartX) / Math.max(pointCount, 1);

  if (milestones.length > 0) {
    milestones.forEach((text, i) => {
      const cx = lineStartX + spacing * (i + 0.5);

      // Circle node
      pptxSlide.addShape(pres.ShapeType.ellipse, {
        x: cx - 0.2,
        y: lineY - 0.2,
        w: 0.4,
        h: 0.4,
        fill: { color: "1565C0" },
        line: { color: "FFFFFF", width: 2 },
      });

      // Node number inside circle
      pptxSlide.addText(String(i + 1), {
        x: cx - 0.2,
        y: lineY - 0.2,
        w: 0.4,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: "FFFFFF",
        align: "center",
        fontFace: "Microsoft YaHei",
        valign: "middle",
      });

      // Text label above or below (alternate)
      const labelY = i % 2 === 0 ? lineY - 1.5 : lineY + 0.5;
      pptxSlide.addText(text, {
        x: cx - spacing * 0.45,
        y: labelY,
        w: spacing * 0.9,
        h: 1.2,
        fontSize: 13,
        color: "333333",
        align: "center",
        fontFace: "Microsoft YaHei",
        valign: i % 2 === 0 ? "bottom" : "top",
      });
      editableTextCount++;
    });
  } else {
    // Fallback: show demo milestones
    const demoLabels = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"];
    demoLabels.forEach((label, i) => {
      const cx = lineStartX + spacing * (i + 0.5);

      pptxSlide.addShape(pres.ShapeType.ellipse, {
        x: cx - 0.2,
        y: lineY - 0.2,
        w: 0.4,
        h: 0.4,
        fill: { color: "1565C0" },
      });

      pptxSlide.addText(String(i + 1), {
        x: cx - 0.2,
        y: lineY - 0.2,
        w: 0.4,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: "FFFFFF",
        align: "center",
        fontFace: "Microsoft YaHei",
        valign: "middle",
      });

      const labelY = i % 2 === 0 ? lineY - 1.5 : lineY + 0.5;
      pptxSlide.addText(label, {
        x: cx - spacing * 0.45,
        y: labelY,
        w: spacing * 0.9,
        h: 1.2,
        fontSize: 13,
        color: "333333",
        align: "center",
        fontFace: "Microsoft YaHei",
        valign: i % 2 === 0 ? "bottom" : "top",
      });
      editableTextCount++;
    });
  }

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
