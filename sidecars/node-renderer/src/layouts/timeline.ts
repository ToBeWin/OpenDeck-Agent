import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderTimeline(
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

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8, y: 0.4, w: 11.7, h: 1.0,
      fontSize: theme.typography.titleSize - 14, bold: true, color: theme.colors.textPrimary, align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  const lineY = 3.5;
  const lineStartX = 1.0;
  const lineEndX = 12.33;

  pptxSlide.addShape(pres.ShapeType.rect, {
    x: lineStartX, y: lineY - 0.02, w: lineEndX - lineStartX, h: 0.04,
    fill: { color: theme.colors.primary },
  });

  let milestones: string[] = [];
  if (bodyEls.length > 1) {
    milestones = bodyEls.map((el) => el.content || "").filter(Boolean);
  } else if (bodyEls.length === 1) {
    const raw = bodyEls[0].content || "";
    const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);
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
    if (milestones.length === 0) milestones = lines;
  }

  const pointCount = Math.max(milestones.length, 1);
  const spacing = (lineEndX - lineStartX) / Math.max(pointCount, 1);

  if (milestones.length > 0) {
    milestones.forEach((text, i) => {
      const cx = lineStartX + spacing * (i + 0.5);

      pptxSlide.addShape(pres.ShapeType.ellipse, {
        x: cx - 0.2, y: lineY - 0.2, w: 0.4, h: 0.4,
        fill: { color: theme.colors.primary },
        line: { color: theme.colors.background, width: 2 },
      });

      pptxSlide.addText(String(i + 1), {
        x: cx - 0.2, y: lineY - 0.2, w: 0.4, h: 0.4,
        fontSize: 12, bold: true, color: theme.colors.textInverse, align: "center",
        fontFace: theme.typography.bodyFont, valign: "middle",
      });

      const labelY = i % 2 === 0 ? lineY - 1.5 : lineY + 0.5;
      pptxSlide.addText(text, {
        x: cx - spacing * 0.45, y: labelY, w: spacing * 0.9, h: 1.2,
        fontSize: 13, color: theme.colors.textPrimary, align: "center",
        fontFace: theme.typography.bodyFont, valign: i % 2 === 0 ? "bottom" : "top",
      });
      editableTextCount++;
    });
  } else {
    const demoLabels = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"];
    demoLabels.forEach((label, i) => {
      const cx = lineStartX + spacing * (i + 0.5);

      pptxSlide.addShape(pres.ShapeType.ellipse, {
        x: cx - 0.2, y: lineY - 0.2, w: 0.4, h: 0.4,
        fill: { color: theme.colors.primary },
      });

      pptxSlide.addText(String(i + 1), {
        x: cx - 0.2, y: lineY - 0.2, w: 0.4, h: 0.4,
        fontSize: 12, bold: true, color: theme.colors.textInverse, align: "center",
        fontFace: theme.typography.bodyFont, valign: "middle",
      });

      const labelY = i % 2 === 0 ? lineY - 1.5 : lineY + 0.5;
      pptxSlide.addText(label, {
        x: cx - spacing * 0.45, y: labelY, w: spacing * 0.9, h: 1.2,
        fontSize: 13, color: theme.colors.textPrimary, align: "center",
        fontFace: theme.typography.bodyFont, valign: i % 2 === 0 ? "bottom" : "top",
      });
      editableTextCount++;
    });
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
