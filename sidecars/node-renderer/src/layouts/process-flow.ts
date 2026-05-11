import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderProcessFlow(
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
      h: 1.0,
      fontSize: theme.typography.titleSize - 14,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Collect steps from elements
  let steps: string[] = [];
  if (bodyEls.length > 1) {
    steps = bodyEls.map((el) => el.content || "").filter(Boolean);
  } else if (bodyEls.length === 1) {
    steps = (bodyEls[0].content || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Fallback demo steps
  if (steps.length === 0) {
    steps = ["Step 1", "Step 2", "Step 3", "Step 4"];
  }

  // Limit to 5 steps for readability
  const maxSteps = Math.min(steps.length, 5);
  const stepWidth = 2.0;
  const arrowWidth = 0.5;
  const totalStepsWidth = maxSteps * stepWidth + (maxSteps - 1) * arrowWidth;
  const startX = (13.33 - totalStepsWidth) / 2;
  const stepY = 3.0;
  const stepHeight = 2.0;

  for (let i = 0; i < maxSteps; i++) {
    const x = startX + i * (stepWidth + arrowWidth);

    // Step rounded rectangle
    pptxSlide.addShape(pres.ShapeType.roundRect, {
      x,
      y: stepY,
      w: stepWidth,
      h: stepHeight,
      fill: { color: i === 0 ? theme.colors.primary : theme.colors.surface },
      line: { color: theme.colors.primary, width: 1.5 },
      rectRadius: 0.15,
    });

    // Step number badge
    pptxSlide.addShape(pres.ShapeType.ellipse, {
      x: x + stepWidth / 2 - 0.22,
      y: stepY + 0.25,
      w: 0.44,
      h: 0.44,
      fill: { color: theme.colors.primary },
    });
    pptxSlide.addText(String(i + 1), {
      x: x + stepWidth / 2 - 0.22,
      y: stepY + 0.25,
      w: 0.44,
      h: 0.44,
      fontSize: 14,
      bold: true,
      color: theme.colors.textInverse,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "middle",
    });

    // Step text
    pptxSlide.addText(steps[i], {
      x: x + 0.15,
      y: stepY + 0.85,
      w: stepWidth - 0.3,
      h: stepHeight - 1.0,
      fontSize: theme.typography.bodySize - 2,
      color: i === 0 ? theme.colors.textInverse : theme.colors.textPrimary,
      align: "center",
      fontFace: theme.typography.bodyFont,
      valign: "middle",
    });
    editableTextCount++;

    // Arrow connecting to next step
    if (i < maxSteps - 1) {
      const arrowX = x + stepWidth;
      const arrowY = stepY + stepHeight / 2;

      // Arrow shaft
      pptxSlide.addShape(pres.ShapeType.rect, {
        x: arrowX + 0.05,
        y: arrowY - 0.03,
        w: arrowWidth - 0.2,
        h: 0.06,
        fill: { color: theme.colors.primary },
      });

      // Arrow head (small triangle approximation using a right-pointing shape)
      pptxSlide.addShape(pres.ShapeType.rect, {
        x: arrowX + arrowWidth - 0.25,
        y: arrowY - 0.1,
        w: 0.15,
        h: 0.2,
        fill: { color: theme.colors.primary },
        rotate: 45,
      });
    }
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
