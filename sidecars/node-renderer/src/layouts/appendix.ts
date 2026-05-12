import PptxGenJS from "pptxgenjs";
import type { SlideData } from "../renderer";
import type { ThemeTokens } from "../theme";
import type { SlideRenderStats } from ".";

export function renderAppendix(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  pptxSlide.background = { fill: theme.colors.background };

  let editableTextCount = 0;

  // Title
  const title = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  if (title) {
    pptxSlide.addText(title.content || "附录", {
      x: 0.8, y: 0.4, w: 11.73, h: 0.8,
      fontSize: theme.typography.titleSize - 2,
      bold: true,
      color: theme.colors.accent,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Decorative line under title
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.2, w: 2.0, h: 0.04,
    fill: { type: "solid", color: theme.colors.accent },
    line: { width: 0 },
  });

  const bodyElements = slide.elements.filter(
    (el) => el.type === "text" && el.role === "body"
  );

  // Sources section
  if (bodyElements.length > 0) {
    pptxSlide.addText("参考资料与数据来源", {
      x: 0.8, y: 1.6, w: 11.73, h: 0.5,
      fontSize: 13,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  bodyElements.forEach((el, i) => {
    pptxSlide.addText(el.content || "", {
      x: 0.8, y: 2.3 + i * 0.45, w: 11.73, h: 0.4,
      fontSize: 10,
      color: theme.colors.textSecondary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      bullet: { code: "2022" },
    });
    editableTextCount++;
  });

  // Table elements
  slide.elements
    .filter((el) => el.type === "table")
    .forEach((el) => {
      if (el.headers && el.rows) {
        const headerRow = el.headers.map((h) => ({ text: h, options: { bold: true, color: theme.colors.textPrimary, fontSize: 9, fontFace: theme.typography.bodyFont } }));
        const dataRows = el.rows.map((row) =>
          row.map((cell) => ({ text: cell, options: { color: theme.colors.textSecondary, fontSize: 9, fontFace: theme.typography.bodyFont } }))
        );
        const tableRows = [headerRow, ...dataRows];
        pptxSlide.addTable(tableRows, {
          x: 0.8, y: 2.3 + bodyElements.length * 0.45 + 0.3,
          w: 11.73,
          border: { type: "solid", color: theme.colors.border, pt: 0.5 },
          colW: [1.5, 1.5, 1.5, 1.5, 1.5],
          rowH: [0.35, 0.3, 0.3, 0.3],
          autoPage: false,
        });
      }
    });

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount: 1 };
}
