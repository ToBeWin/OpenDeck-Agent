import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderChartFocus(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;
  let chartCount = 0;

  pptxSlide.background = { fill: theme.colors.background };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const chartEl = slide.elements.find((el) => el.type === "chart");
  const captionEl = slide.elements.find((el) => el.type === "text" && el.role === "caption");

  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8, y: 0.3, w: 11.7, h: 0.9,
      fontSize: theme.typography.titleSize - 16, bold: true, color: theme.colors.textPrimary, align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  let chartData: Array<{ name: string; labels: string[]; values: number[] }>;

  if (chartEl && chartEl.data) {
    const data = chartEl.data as Record<string, unknown>;
    if (Array.isArray(data.labels) && Array.isArray(data.values)) {
      const labels = data.labels as string[];
      const values = data.values as number[];
      const seriesName = typeof data.label === "string" ? data.label : "Data";
      chartData = [{ name: seriesName, labels, values }];
    } else if (Array.isArray(data.categories) && Array.isArray(data.series)) {
      const categories = data.categories as string[];
      const series = data.series as Array<{ name: string; values: number[] }>;
      chartData = series.map((s) => ({ name: s.name, labels: categories, values: s.values }));
    } else {
      chartData = [{ name: "Sample", labels: ["Q1", "Q2", "Q3", "Q4"], values: [25, 40, 35, 50] }];
    }
  } else {
    chartData = [{ name: "Sample", labels: ["Q1", "Q2", "Q3", "Q4"], values: [25, 40, 35, 50] }];
  }

  const labelEl = slide.elements.find((el) => el.type === "text" && el.role === "label");
  if (labelEl) {
    pptxSlide.addText(labelEl.content || "", {
      x: 0.8, y: 1.3, w: 11.7, h: 0.5,
      fontSize: theme.typography.bodySize - 4, color: theme.colors.textSecondary, align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  // Map chart type to PptxGenJS chart type
  const chartTypeMap: Record<string, string> = {
    bar: "bar",
    line: "line",
    pie: "pie",
    area: "area",
    scatter: "scatter",
  };
  const chartTypeName: string = chartEl?.chartType ?? "bar";
  const pptxChartType = chartTypeMap[chartTypeName] || "bar";

  // Pie charts use a different data format (single series, labels + values)
  const isPie = chartTypeName === "pie";
  const pieData = isPie && Array.isArray((chartEl?.data as Record<string, unknown>)?.labels)
    ? [{ name: "Distribution", labels: (chartEl?.data as Record<string, unknown>).labels as string[], values: (chartEl?.data as Record<string, unknown>).values as number[] }]
    : undefined;

  const finalChartData = pieData ?? chartData;

  const chartOpts: Record<string, unknown> = {
    x: 0.8,
    y: labelEl ? 1.9 : 1.5,
    w: 11.7,
    h: 4.5,
    showTitle: false,
    showValue: !isPie,
    showLegend: isPie,
    catAxisLabelFontSize: 12,
    valAxisLabelFontSize: 10,
    catAxisLabelColor: theme.colors.textPrimary,
    valAxisLabelColor: theme.colors.textPrimary,
    chartColors: theme.colors.chartColors.slice(0, isPie ? 8 : 4),
  };

  if (!isPie) {
    chartOpts.barGapWidthPct = 80;
    chartOpts.lineSize = 2.5;
  }

  pptxSlide.addChart(pptxChartType as "bar" | "line" | "pie" | "area" | "scatter", finalChartData, chartOpts as PptxGenJS.IChartOpts);
  chartCount++;

  if (captionEl) {
    pptxSlide.addText(captionEl.content || "", {
      x: 0.8, y: 6.7, w: 11.7, h: 0.5,
      fontSize: theme.typography.captionSize - 2, color: theme.colors.secondary, align: "center",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount: 0, chartCount, tableCount: 0 };
}
