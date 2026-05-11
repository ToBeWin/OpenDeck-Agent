import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { SlideRenderStats } from "./index";

/**
 * Chart Focus layout.
 * Title at top + bar chart via addChart() with data from the deck or demo data.
 */
export function renderChartFocus(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number
): SlideRenderStats {
  const pptxSlide = pres.addSlide();

  let editableTextCount = 0;
  let chartCount = 0;

  // Background
  pptxSlide.background = { fill: "FFFFFF" };

  // Extract elements
  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const chartEl = slide.elements.find((el) => el.type === "chart");
  const captionEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "caption"
  );

  // Title
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.3,
      w: 11.7,
      h: 0.9,
      fontSize: 28,
      bold: true,
      color: "1A1A2E",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Chart data — use element data if present, otherwise demo
  // Support both formats: {labels, values} and {categories, series}
  let chartData: Array<{ name: string; labels: string[]; values: number[] }>;

  if (chartEl && chartEl.data) {
    const data = chartEl.data as Record<string, unknown>;
    if (Array.isArray(data.labels) && Array.isArray(data.values)) {
      // Format: { label, labels, values }
      const labels = data.labels as string[];
      const values = data.values as number[];
      const seriesName = typeof data.label === "string" ? data.label : "Data";
      chartData = [{ name: seriesName, labels, values }];
    } else if (Array.isArray(data.categories) && Array.isArray(data.series)) {
      // Format: { categories, series: [{ name, values }] }
      const categories = data.categories as string[];
      const series = data.series as Array<{ name: string; values: number[] }>;
      chartData = series.map((s) => ({
        name: s.name,
        labels: categories,
        values: s.values,
      }));
    } else {
      // Fallback
      chartData = [{ name: "Sample", labels: ["Q1", "Q2", "Q3", "Q4"], values: [25, 40, 35, 50] }];
    }
  } else {
    // Demo data
    chartData = [{ name: "Sample", labels: ["Q1", "Q2", "Q3", "Q4"], values: [25, 40, 35, 50] }];
  }

  // Also look for a label element
  const labelEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "label"
  );
  if (labelEl) {
    pptxSlide.addText(labelEl.content || "", {
      x: 0.8,
      y: 1.3,
      w: 11.7,
      h: 0.5,
      fontSize: 14,
      color: "546E7A",
      align: "left",
      fontFace: "Microsoft YaHei",
    });
    editableTextCount++;
  }

  // Add bar chart
  pptxSlide.addChart(pres.ChartType.bar, chartData, {
    x: 0.8,
    y: labelEl ? 1.9 : 1.5,
    w: 11.7,
    h: 4.5,
    showTitle: false,
    showValue: true,
    catAxisLabelFontSize: 12,
    valAxisLabelFontSize: 10,
    catAxisLabelColor: "333333",
    valAxisLabelColor: "333333",
    chartColors: ["1565C0", "4FC3F7", "FF7043", "66BB6A"],
    barGapWidthPct: 80,
  });
  chartCount++;

  // Caption
  if (captionEl) {
    pptxSlide.addText(captionEl.content || "", {
      x: 0.8,
      y: 6.7,
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

  return { editableTextCount, imageCount: 0, chartCount, tableCount: 0 };
}
