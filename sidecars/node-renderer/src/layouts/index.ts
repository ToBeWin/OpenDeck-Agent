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
import { renderSectionDivider } from "./section-divider";
import { renderProblem } from "./problem";
import { renderSolution } from "./solution";
import { renderProcessFlow } from "./process-flow";
import { renderCaseStudy } from "./case-study";
import { renderQuote } from "./quote";
import { renderSummary } from "./summary";
import { renderImageText } from "./image-text";
import { renderFullBleedImage } from "./full-bleed-image";
import { renderConsultingSummary } from "./consulting-summary";
import { renderAppendix } from "./appendix";
import { renderSlideImage } from "./image-helper";

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

  // Section divider
  section_divider: renderSectionDivider,

  // Problem
  problem: renderProblem,

  // Solution
  solution: renderSolution,

  // Process flow
  process: renderProcessFlow,
  process_flow: renderProcessFlow,

  // Case study
  case_study: renderCaseStudy,

  // Quote
  quote: renderQuote,
  quote_focus: renderQuote,

  // Summary / grid cards
  summary: renderSummary,
  grid_cards: renderSummary,

  // Image + text
  image_left_text_right: renderImageText,
  image_right_text_left: renderImageText,

  // Full bleed image
  full_bleed_image: renderFullBleedImage,

  // Consulting summary
  consulting_summary: renderConsultingSummary,

  // Appendix
  appendix: renderAppendix,
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

  let imageCount = 0;
  let editableTextCount = 0;

  // Render image if present
  const imageEl = slide.elements.find((el) => el.type === "image");
  if (imageEl?.source) {
    imageCount = renderSlideImage(pres, pptxSlide, slide, 0.8, 1.0, 5.0, 5.0, theme);
  }

  const title = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const body = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );

  const textX = imageEl?.source ? 6.2 : 0.8;
  const textW = imageEl?.source ? 6.3 : 11.7;

  if (title) {
    pptxSlide.addText(title.content || "", {
      x: textX,
      y: 1.5,
      w: textW,
      h: 1.5,
      fontSize: theme.typography.titleSize - 8,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  if (body) {
    pptxSlide.addText(body.content || "", {
      x: textX,
      y: 3.2,
      w: textW,
      h: 3.0,
      fontSize: theme.typography.bodySize,
      color: theme.colors.textSecondary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      valign: "top",
    });
    editableTextCount++;
  }

  return { editableTextCount, imageCount, chartCount: 0, tableCount: 0 };
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
