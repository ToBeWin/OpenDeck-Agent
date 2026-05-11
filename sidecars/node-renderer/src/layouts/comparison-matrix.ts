import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderComparisonMatrix(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;
  let tableCount = 0;

  pptxSlide.background = { fill: theme.colors.background };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const tableEl = slide.elements.find((el) => el.type === "table");

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8, y: 0.4, w: 11.7, h: 1.0,
      fontSize: theme.typography.titleSize - 14, bold: true, color: theme.colors.textPrimary, align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  if (tableEl && tableEl.headers && tableEl.rows) {
    const headerRow = tableEl.headers.map((h: string) => ({
      text: h,
      options: {
        bold: true, color: theme.colors.textInverse,
        fill: { color: theme.colors.primary },
        fontSize: 14, fontFace: theme.typography.bodyFont,
        align: "center" as const, valign: "middle" as const,
      },
    }));

    const dataRows = tableEl.rows.map((row: string[], rowIdx: number) =>
      row.map((cell: string) => ({
        text: cell,
        options: {
          fontSize: 13, color: theme.colors.textPrimary,
          fill: { color: rowIdx % 2 === 0 ? theme.colors.surface : theme.colors.background },
          fontFace: theme.typography.bodyFont,
          align: "center" as const, valign: "middle" as const,
        },
      }))
    );

    pptxSlide.addTable([headerRow, ...dataRows], {
      x: 0.8, y: 1.8, w: 11.7,
      border: { type: "solid", pt: 0.5, color: theme.colors.border },
      colW: Array(tableEl.headers.length).fill(11.7 / tableEl.headers.length),
      autoPage: false,
    });
    tableCount++;
  } else {
    const demoHeaders = ["Feature", "Option A", "Option B", "Option C"];
    const demoRows = [
      ["Performance", "High", "Medium", "Low"],
      ["Cost", "$100", "$200", "$50"],
      ["Scalability", "Excellent", "Good", "Fair"],
    ];

    const headerRow = demoHeaders.map((h) => ({
      text: h,
      options: {
        bold: true, color: theme.colors.textInverse,
        fill: { color: theme.colors.primary },
        fontSize: 14, fontFace: theme.typography.bodyFont,
        align: "center" as const, valign: "middle" as const,
      },
    }));

    const dataRows = demoRows.map((row, rowIdx) =>
      row.map((cell) => ({
        text: cell,
        options: {
          fontSize: 13, color: theme.colors.textPrimary,
          fill: { color: rowIdx % 2 === 0 ? theme.colors.surface : theme.colors.background },
          fontFace: theme.typography.bodyFont,
          align: "center" as const, valign: "middle" as const,
        },
      }))
    );

    pptxSlide.addTable([headerRow, ...dataRows], {
      x: 0.8, y: 1.8, w: 11.7,
      border: { type: "solid", pt: 0.5, color: theme.colors.border },
      colW: [2.925, 2.925, 2.925, 2.925],
      autoPage: false,
    });
    tableCount++;

    pptxSlide.addText("(Demo table — replace with actual data)", {
      x: 0.8, y: 6.5, w: 11.7, h: 0.5,
      fontSize: 11, color: theme.colors.secondary, align: "center",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount };
}
