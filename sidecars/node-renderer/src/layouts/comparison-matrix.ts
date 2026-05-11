import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Comparison Matrix layout.
 * Title at top + editable table via addTable().
 */
export function renderComparisonMatrix(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number
): SlideRenderStats {
  const pptxSlide = pres.addSlide();

  let editableTextCount = 0;
  let tableCount = 0;

  // Background
  pptxSlide.background = { fill: "FFFFFF" };

  // Extract elements
  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const tableEl = slide.elements.find((el) => el.type === "table");

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

  // Table
  if (tableEl && tableEl.headers && tableEl.rows) {
    const headerRow = tableEl.headers.map((h: string) => ({
      text: h,
      options: {
        bold: true,
        color: "FFFFFF",
        fill: { color: "1565C0" },
        fontSize: 14,
        fontFace: "Microsoft YaHei",
        align: "center" as const,
        valign: "middle" as const,
      },
    }));

    const dataRows = tableEl.rows.map((row: string[], rowIdx: number) =>
      row.map((cell: string) => ({
        text: cell,
        options: {
          fontSize: 13,
          color: "333333",
          fill: { color: rowIdx % 2 === 0 ? "F5F7FA" : "FFFFFF" },
          fontFace: "Microsoft YaHei",
          align: "center" as const,
          valign: "middle" as const,
        },
      }))
    );

    const tableData = [headerRow, ...dataRows];

    pptxSlide.addTable(tableData, {
      x: 0.8,
      y: 1.8,
      w: 11.7,
      border: { type: "solid", pt: 0.5, color: "E0E0E0" },
      colW: Array(tableEl.headers.length).fill(
        11.7 / tableEl.headers.length
      ),
      autoPage: false,
    });
    tableCount++;
  } else {
    // Fallback: render a simple demo table
    const demoHeaders = ["Feature", "Option A", "Option B", "Option C"];
    const demoRows = [
      ["Performance", "High", "Medium", "Low"],
      ["Cost", "$100", "$200", "$50"],
      ["Scalability", "Excellent", "Good", "Fair"],
    ];

    const headerRow = demoHeaders.map((h) => ({
      text: h,
      options: {
        bold: true,
        color: "FFFFFF",
        fill: { color: "1565C0" },
        fontSize: 14,
        fontFace: "Microsoft YaHei",
        align: "center" as const,
        valign: "middle" as const,
      },
    }));

    const dataRows = demoRows.map((row, rowIdx) =>
      row.map((cell) => ({
        text: cell,
        options: {
          fontSize: 13,
          color: "333333",
          fill: { color: rowIdx % 2 === 0 ? "F5F7FA" : "FFFFFF" },
          fontFace: "Microsoft YaHei",
          align: "center" as const,
          valign: "middle" as const,
        },
      }))
    );

    pptxSlide.addTable([headerRow, ...dataRows], {
      x: 0.8,
      y: 1.8,
      w: 11.7,
      border: { type: "solid", pt: 0.5, color: "E0E0E0" },
      colW: [2.925, 2.925, 2.925, 2.925],
      autoPage: false,
    });
    tableCount++;

    // Add a label text for the fallback
    pptxSlide.addText("(Demo table — replace with actual data)", {
      x: 0.8,
      y: 6.5,
      w: 11.7,
      h: 0.5,
      fontSize: 11,
      color: "90A4AE",
      align: "center",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  if (slide.speakerNote) {
    pptxSlide.addNotes(slide.speakerNote);
  }

  return { editableTextCount, imageCount: 0, chartCount: 0, tableCount };
}
