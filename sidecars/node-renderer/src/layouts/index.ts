import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { renderCover } from "./cover";
import { renderAgenda } from "./agenda";
import { renderInsight } from "./insight";
import { renderTwoColumn } from "./two-column";
import { renderComparisonMatrix } from "./comparison-matrix";
import { renderTimeline } from "./timeline";
import { renderChartFocus } from "./chart-focus";
import { renderClosing } from "./closing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlideRenderStats {
  editableTextCount: number;
  imageCount: number;
  chartCount: number;
  tableCount: number;
}

export type LayoutRenderer = (
  pres: PptxGenJS,
  slide: SlideData,
  slideIndex: number,
  theme: ThemeTokens
) => SlideRenderStats;

// ---------------------------------------------------------------------------
// Layout map
// ---------------------------------------------------------------------------

const layoutMap: Record<string, LayoutRenderer> = {
  // Cover
  hero_title: renderCover,
  cover: renderCover,

  // Agenda
  title_content: renderAgenda,
  agenda: renderAgenda,

  // Insight / big number
  big_number: renderInsight,
  insight: renderInsight,

  // Two column
  two_column: renderTwoColumn,

  // Comparison matrix
  comparison_matrix: renderComparisonMatrix,

  // Timeline
  timeline_horizontal: renderTimeline,
  timeline_vertical: renderTimeline,
  timeline: renderTimeline,

  // Chart focus
  chart_focus: renderChartFocus,
  chart: renderChartFocus,

  // Closing
  closing: renderClosing,
  quote_focus: renderClosing,
};

// Fallback for section_divider and other unhandled layouts
function renderFallback(
  pres: PptxGenJS,
  slide: SlideData,
  slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  pptxSlide.background = { fill: theme.colors.background };

  const title = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const body = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );

  if (title) {
    pptxSlide.addText(title.content || "", {
      x: 0.8,
      y: 1.5,
      w: 11.7,
      h: 1.5,
      fontSize: theme.typography.titleSize - 8,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
  }

  if (body) {
    pptxSlide.addText(body.content || "", {
      x: 0.8,
      y: 3.2,
      w: 11.7,
      h: 3.0,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textSecondary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
  }

  return {
    editableTextCount: (title ? 1 : 0) + (body ? 1 : 0),
    imageCount: 0,
    chartCount: 0,
    tableCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function renderSlide(
  pres: PptxGenJS,
  slide: SlideData,
  slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const renderer = layoutMap[slide.layout] || renderFallback;
  return renderer(pres, slide, slideIndex, theme);
}
