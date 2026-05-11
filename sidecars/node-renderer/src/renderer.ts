import * as fs from "fs";
import * as path from "path";
import PptxGenJS from "pptxgenjs";
import { renderSlide } from "./layouts";
import { resolveTheme, type ThemeTokens } from "./theme";

// ---------------------------------------------------------------------------
// Types (loosely matching the Slide DSL from AGENTS.md)
// ---------------------------------------------------------------------------

export interface SlideElement {
  id: string;
  type: "text" | "image" | "table" | "chart" | "shape" | "icon" | "group";
  role?: string;
  content?: string;
  editable?: boolean;
  position?: { x: number; y: number; w: number; h: number; unit?: string };
  style?: Record<string, unknown>;
  // Table-specific
  headers?: string[];
  rows?: string[][];
  // Chart-specific
  chartType?: string;
  data?: unknown;
  // Image-specific
  source?: string;
  sourceType?: string;
}

export interface SlideData {
  id: string;
  index: number;
  type: string;
  layout: string;
  communicationGoal?: string;
  mainMessage?: string;
  elements: SlideElement[];
  speakerNote?: string;
}

export interface DeckData {
  id: string;
  title: string;
  language?: string;
  aspectRatio?: string;
  theme?: Record<string, unknown>;
  slides: SlideData[];
  metadata?: Record<string, unknown>;
}

export interface RenderResult {
  filePath: string;
  warnings: string[];
  stats: {
    slideCount: number;
    editableTextCount: number;
    imageCount: number;
    chartCount: number;
    tableCount: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findElement(
  elements: SlideElement[],
  type: string,
  role?: string
): SlideElement | undefined {
  return elements.find(
    (el) => el.type === type && (role === undefined || el.role === role)
  );
}

function findElements(
  elements: SlideElement[],
  type: string,
  role?: string
): SlideElement[] {
  return elements.filter(
    (el) => el.type === type && (role === undefined || el.role === role)
  );
}

// Export helpers for layout files
export { findElement, findElements };

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export async function renderPptx(
  deckPath: string,
  outputPath: string,
  _mode: string
): Promise<RenderResult> {
  // Read deck JSON
  const resolvedDeckPath = path.resolve(deckPath);
  const deckRaw = fs.readFileSync(resolvedDeckPath, "utf-8");
  const deck: DeckData = JSON.parse(deckRaw);

  const warnings: string[] = [];
  let editableTextCount = 0;
  let imageCount = 0;
  let chartCount = 0;
  let tableCount = 0;

  // Resolve theme from deck data or use default
  const theme = resolveTheme(deck.theme as Partial<ThemeTokens> | undefined);

  // Create presentation — 16:9 (13.33 x 7.5 inches)
  const pres = new PptxGenJS();
  pres.defineLayout({ name: "CUSTOM_16x9", width: 13.33, height: 7.5 });
  pres.layout = "CUSTOM_16x9";
  pres.author = "OpenDeck Agent";
  pres.company = "OpenDeck";
  pres.subject = deck.title || "Presentation";
  pres.title = deck.title || "Presentation";

  // Render each slide
  for (let i = 0; i < deck.slides.length; i++) {
    const slide = deck.slides[i];
    try {
      const stats = renderSlide(pres, slide, i, theme);
      editableTextCount += stats.editableTextCount;
      imageCount += stats.imageCount;
      chartCount += stats.chartCount;
      tableCount += stats.tableCount;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      warnings.push(`Slide ${i} (${slide.layout}): ${msg}`);
      // Add a fallback blank slide so the deck still has the right count
      const fallbackSlide = pres.addSlide();
      fallbackSlide.addText(`[Render error: ${slide.layout}]`, {
        x: 1,
        y: 3,
        w: 11,
        h: 1.5,
        fontSize: 18,
        color: "FF0000",
        align: "center",
      });
    }
  }

  // Save
  const resolvedOutput = path.resolve(outputPath);
  const outputDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  await pres.writeFile({ fileName: resolvedOutput });

  return {
    filePath: resolvedOutput,
    warnings,
    stats: {
      slideCount: deck.slides.length,
      editableTextCount,
      imageCount,
      chartCount,
      tableCount,
    },
  };
}
