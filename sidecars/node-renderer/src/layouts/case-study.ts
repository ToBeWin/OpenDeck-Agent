import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderCaseStudy(
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
    (el) => el.type === "text" && el.role === "body"
  );
  const subtitleEl = slide.elements.find(
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
      h: 1.0,
      fontSize: theme.typography.titleSize - 12,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Subtitle (e.g., client name or context)
  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: 0.8,
      y: 1.4,
      w: 11.7,
      h: 0.5,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textSecondary,
      align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  // Divider
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 2.0,
    w: 11.7,
    h: 0.03,
    fill: { color: theme.colors.border },
  });

  // Three columns: Challenge, Approach, Result
  const sections = [
    {
      label: labelEls[0]?.content || "Challenge",
      body: bodyEls[0]?.content || "",
      color: theme.colors.accent,
    },
    {
      label: labelEls[1]?.content || "Approach",
      body: bodyEls[1]?.content || "",
      color: theme.colors.primary,
    },
    {
      label: labelEls[2]?.content || "Result",
      body: bodyEls[2]?.content || "",
      color: theme.colors.chartColors[2] || theme.colors.primary,
    },
  ];

  const colWidth = 3.6;
  const colGap = 0.35;
  const totalWidth = sections.length * colWidth + (sections.length - 1) * colGap;
  const startX = (13.33 - totalWidth) / 2;

  sections.forEach((section, i) => {
    const x = startX + i * (colWidth + colGap);
    const y = 2.3;

    // Section card
    pptxSlide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: colWidth,
      h: 4.5,
      fill: { color: theme.colors.surface },
      rectRadius: 0.1,
    });

    // Color accent bar at top of card
    pptxSlide.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: colWidth,
      h: 0.08,
      fill: { color: section.color },
    });

    // Section label
    pptxSlide.addText(section.label, {
      x: x + 0.2,
      y: y + 0.3,
      w: colWidth - 0.4,
      h: 0.5,
      fontSize: theme.typography.bodySize,
      bold: true,
      color: section.color,
      align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;

    // Section body
    if (section.body) {
      pptxSlide.addText(section.body, {
        x: x + 0.2,
        y: y + 1.0,
        w: colWidth - 0.4,
        h: 3.2,
        fontSize: theme.typography.bodySize - 2,
        color: theme.colors.textPrimary,
        align: "left",
        fontFace: theme.typography.bodyFont,
        valign: "top",
        lineSpacing: 24,
      });
      editableTextCount++;
    }
  });

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 0 };
}
